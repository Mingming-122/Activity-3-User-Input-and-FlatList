import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
  Platform,
  Keyboard,
} from 'react-native';
import { COLORS, CATEGORY_DEFINITIONS } from './theme';

// Standalone form for adding custom items to storage (isolated state fixes focus loss bug)
function AddStorageItemForm({ onSave, onCancel }) {
  const [name, setName] = useState('');
  const [measurement, setMeasurement] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_DEFINITIONS[0]);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter an item name');
      return;
    }

    onSave({
      name: trimmedName,
      measurement: measurement.trim() || '1 unit',
      category: selectedCategory.name,
      categoryIcon: selectedCategory.icon,
      qty: qty,
    });

    setName('');
    setMeasurement('');
    setQty(1);
    setError('');
    Keyboard.dismiss();
  };

  return (
    <View style={styles.customAddCard}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.customAddTitle}>Add Item to Storage</Text>
        {onCancel ? (
          <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={styles.inputLabel}>Item Name:</Text>
      <TextInput
        style={[styles.customInput, error ? styles.inputError : null]}
        placeholder="e.g., Hot Pandesal, Eden Cheese, Corned Beef..."
        placeholderTextColor="#A8A89A"
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (error) setError('');
        }}
        autoCapitalize="words"
        returnKeyType="next"
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Text style={styles.inputLabel}>Measurement / Unit:</Text>
      <TextInput
        style={styles.customInput}
        placeholder="e.g., 1L tetra pak, 500g pack, 1 dozen, 6 pcs..."
        placeholderTextColor="#A8A89A"
        value={measurement}
        onChangeText={setMeasurement}
        returnKeyType="done"
      />

      <Text style={styles.inputLabel}>Kitchen Storage Bin:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryPillsScroll}
      >
        {CATEGORY_DEFINITIONS.map((cat) => {
          const isSelected = selectedCategory.id === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.formCatPill,
                isSelected && styles.formCatPillSelected,
              ]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.7}
            >
              <Text style={styles.formCatPillEmoji}>{cat.icon}</Text>
              <Text
                style={[
                  styles.formCatPillText,
                  isSelected && styles.formCatPillTextSelected,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.formQtyRow}>
        <Text style={styles.formQtyLabel}>Number in Storage:</Text>
        <View style={styles.formQtyStepper}>
          <TouchableOpacity
            style={styles.formQtyBtn}
            onPress={() => setQty((q) => Math.max(0, q - 1))}
            activeOpacity={0.6}
          >
            <Text style={styles.formQtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.formQtyValue}>{qty}</Text>
          <TouchableOpacity
            style={styles.formQtyBtn}
            onPress={() => setQty((q) => q + 1)}
            activeOpacity={0.6}
          >
            <Text style={styles.formQtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.saveCustomBtn}
        onPress={handleSave}
        activeOpacity={0.85}
      >
        <Text style={styles.saveCustomBtnText}>
          Save to {selectedCategory.name} Bin
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function CategoriesList({
  storageItems,
  onUpdateStorageQty,
  onAddCustomItem,
  onDeleteStorageItem,
  groceryItems,
  onAddGroceryItem,
}) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [storageFilter, setStorageFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Check if an item is already on the user's active grocery list
  const isItemInTracker = (itemName) => {
    return groceryItems.some(
      (gi) => gi.name.toLowerCase().includes(itemName.toLowerCase()) && !gi.completed
    );
  };

  // Quick add to grocery list
  const handleQuickAdd = (item) => {
    onAddGroceryItem({
      id: item.id,
      name: item.name,
      category: item.category,
      categoryIcon: item.categoryIcon,
      quantity: 1,
      measurement: item.measurement,
    });
  };

  // Save custom item
  const handleSaveCustomItem = ({ name, measurement, category, categoryIcon, qty }) => {
    const newItem = {
      id: `custom-${Date.now()}`,
      name: name,
      category: category,
      categoryIcon: categoryIcon,
      icon: categoryIcon || '📦',
      measurement: measurement,
      measurementUnit: 'units',
      inStorageQty: qty,
      storageTip: `Custom item stored in ${category} bin`,
    };

    onAddCustomItem(newItem);
    setShowAddForm(false);
  };

  // Delete item on long-press with confirmation
  const handleLongPressDelete = (item) => {
    const title = `Delete ${item.name}?`;
    const message = `Are you sure you want to remove "${item.name}" from your ${item.category} storage?`;

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed) {
        onDeleteStorageItem(item.id);
      }
    } else {
      Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteStorageItem(item.id),
        },
      ]);
    }
  };

  // Filter items by category, storage status, and search query
  const filteredItems = storageItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'ALL' ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.measurement && item.measurement.toLowerCase().includes(searchQuery.toLowerCase()));

    const inStorage = (item.inStorageQty || 0) > 0;
    const matchesStorageFilter =
      storageFilter === 'ALL' ||
      (storageFilter === 'IN_STORAGE' && inStorage) ||
      (storageFilter === 'OUT_OF_STOCK' && !inStorage);

    return matchesCategory && matchesSearch && matchesStorageFilter;
  });

  // Calculate storage metrics per category
  const getCategoryStats = (categoryName) => {
    const catItems = storageItems.filter(
      (item) => item.category.toLowerCase() === categoryName.toLowerCase()
    );
    const inStorageCount = catItems.filter((item) => (item.inStorageQty || 0) > 0).length;
    const totalUnits = catItems.reduce((sum, item) => sum + (item.inStorageQty || 0), 0);
    return {
      totalItems: catItems.length,
      inStorageCount,
      totalUnits,
    };
  };

  const totalInStorageItems = storageItems.filter((i) => (i.inStorageQty || 0) > 0).length;
  const totalStorageUnits = storageItems.reduce((acc, i) => acc + (i.inStorageQty || 0), 0);

  // Render individual item card
  const renderItemCard = ({ item }) => {
    const inList = isItemInTracker(item.name);
    const qtyInStorage = item.inStorageQty || 0;
    const isStored = qtyInStorage > 0;

    return (
      <TouchableOpacity
        style={[styles.itemCard, isStored && styles.itemCardStored]}
        onLongPress={() => handleLongPressDelete(item)}
        delayLongPress={450}
        activeOpacity={0.88}
      >
        <View style={[styles.itemIconContainer, isStored && styles.itemIconContainerStored]}>
          <Text style={styles.itemIconEmoji}>{item.icon}</Text>
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>

          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {item.categoryIcon} {item.category}
              </Text>
            </View>

            {item.measurement ? (
              <View style={styles.measurementBadge}>
                <Text style={styles.measurementBadgeText}>
                  📏 {item.measurement}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.storageStatusRow}>
            {isStored ? (
              <View style={styles.inStorageBadge}>
                <Text style={styles.inStorageBadgeText}>
                  📦 In Storage: {qtyInStorage} {item.measurementUnit || 'units'}
                </Text>
              </View>
            ) : (
              <View style={styles.outOfStockBadge}>
                <Text style={styles.outOfStockBadgeText}>
                  ⚠️ 0 in storage (Out of Stock)
                </Text>
              </View>
            )}

            {item.lastBoughtQty ? (
              <View style={styles.recentBoughtBadge}>
                <Text style={styles.recentBoughtText}>
                  +{item.lastBoughtQty} bought
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.actionColumn}>
          <View style={styles.storageStepper}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => onUpdateStorageQty(item.id, -1)}
              activeOpacity={0.6}
            >
              <Text style={styles.stepperBtnText}>-</Text>
            </TouchableOpacity>

            <View style={styles.stepperQtyBox}>
              <Text style={styles.stepperQtyText}>{qtyInStorage}</Text>
              <Text style={styles.stepperQtyLabel}>stored</Text>
            </View>

            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => onUpdateStorageQty(item.id, 1)}
              activeOpacity={0.6}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.groceryAddBtn,
              inList ? styles.groceryAddBtnInList : styles.groceryAddBtnDefault,
            ]}
            onPress={() => handleQuickAdd(item)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.groceryAddBtnText,
                inList ? styles.groceryAddBtnTextInList : styles.groceryAddBtnTextDefault,
              ]}
            >
              {inList ? '✓ In List' : '+ Buy List'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Render header
  const renderHeader = () => {
    const isCategorySelected = selectedCategory !== 'ALL';
    const activeCategoryDef = CATEGORY_DEFINITIONS.find(
      (c) => c.name.toLowerCase() === selectedCategory.toLowerCase()
    );

    return (
      <View style={styles.headerContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.screenEmoji}>🗂️</Text>
          <View style={styles.titleTextWrapper}>
            <Text style={styles.screenTitle}>Kitchen Storage Bins</Text>
            <Text style={styles.screenSubtitle}>
              {totalInStorageItems} items ({totalStorageUnits} units) in storage • Hold item to delete
            </Text>
          </View>
        </View>

        {isCategorySelected && activeCategoryDef ? (
          <View style={styles.activeCategoryBanner}>
            <View style={styles.activeCategoryBannerTop}>
              <View style={styles.activeCategoryInfo}>
                <Text style={styles.activeCategoryBannerEmoji}>
                  {activeCategoryDef.icon}
                </Text>
                <View>
                  <Text style={styles.activeCategoryBannerTitle}>
                    {activeCategoryDef.name} Storage
                  </Text>
                  <Text style={styles.activeCategoryBannerDesc}>
                    {activeCategoryDef.description}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => setSelectedCategory('ALL')}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllBtnText}>Show All Bins</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.activeCategoryStatsRow}>
              <View style={styles.activeStatChip}>
                <Text style={styles.activeStatLabel}>In Stock:</Text>
                <Text style={styles.activeStatValue}>
                  {getCategoryStats(activeCategoryDef.name).inStorageCount} items
                </Text>
              </View>
              <View style={styles.activeStatChip}>
                <Text style={styles.activeStatLabel}>Total Units:</Text>
                <Text style={styles.activeStatValue}>
                  {getCategoryStats(activeCategoryDef.name).totalUnits} stored
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.categoryGrid}>
            {CATEGORY_DEFINITIONS.map((cat) => {
              const stats = getCategoryStats(cat.name);
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryCard}
                  onPress={() => setSelectedCategory(cat.name)}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryCardTop}>
                    <Text style={styles.categoryCardEmoji}>{cat.icon}</Text>
                    <View style={styles.categoryCountBadge}>
                      <Text style={styles.categoryCountText}>
                        {stats.inStorageCount}/{stats.totalItems}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.categoryCardName}>{cat.name}</Text>
                  <Text style={styles.categoryCardSub}>
                    {stats.totalUnits} units in storage
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalPillScroll}
        >
          <TouchableOpacity
            style={[
              styles.navPill,
              selectedCategory === 'ALL' && styles.navPillActive,
            ]}
            onPress={() => setSelectedCategory('ALL')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.navPillText,
                selectedCategory === 'ALL' && styles.navPillTextActive,
              ]}
            >
              All Bins ({storageItems.length})
            </Text>
          </TouchableOpacity>

          {CATEGORY_DEFINITIONS.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            const stats = getCategoryStats(cat.name);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.navPill, isSelected && styles.navPillActive]}
                onPress={() => setSelectedCategory(cat.name)}
                activeOpacity={0.7}
              >
                <Text style={styles.navPillEmoji}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.navPillText,
                    isSelected && styles.navPillTextActive,
                  ]}
                >
                  {cat.name} ({stats.inStorageCount} stored)
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.searchSection}>
          <View style={styles.searchInputWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or measurement..."
              placeholderTextColor="#9A9F97"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.searchClear}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.toggleFormBtn}
            onPress={() => setShowAddForm((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={styles.toggleFormBtnText}>
              {showAddForm ? '✕ Close' : '➕ Custom Item'}
            </Text>
          </TouchableOpacity>
        </View>

        {showAddForm && (
          <AddStorageItemForm
            onSave={handleSaveCustomItem}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        <View style={styles.filterRow}>
          <View style={styles.storageFilterTabs}>
            <TouchableOpacity
              style={[
                styles.storageFilterTab,
                storageFilter === 'ALL' && styles.storageFilterTabActive,
              ]}
              onPress={() => setStorageFilter('ALL')}
            >
              <Text
                style={[
                  styles.storageFilterTabText,
                  storageFilter === 'ALL' && styles.storageFilterTabTextActive,
                ]}
              >
                All Items
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.storageFilterTab,
                storageFilter === 'IN_STORAGE' && styles.storageFilterTabActive,
              ]}
              onPress={() => setStorageFilter('IN_STORAGE')}
            >
              <Text
                style={[
                  styles.storageFilterTabText,
                  storageFilter === 'IN_STORAGE' && styles.storageFilterTabTextActive,
                ]}
              >
                📦 In Storage ({storageItems.filter((i) => (i.inStorageQty || 0) > 0).length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.storageFilterTab,
                storageFilter === 'OUT_OF_STOCK' && styles.storageFilterTabActive,
              ]}
              onPress={() => setStorageFilter('OUT_OF_STOCK')}
            >
              <Text
                style={[
                  styles.storageFilterTabText,
                  storageFilter === 'OUT_OF_STOCK' && styles.storageFilterTabTextActive,
                ]}
              >
                ⚠️ Need Restock ({storageItems.filter((i) => (i.inStorageQty || 0) === 0).length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.resultsBar}>
          <Text style={styles.resultsCount}>
            Showing <Text style={styles.resultsCountBold}>{filteredItems.length}</Text> items
            {selectedCategory !== 'ALL' ? ` in ${selectedCategory}` : ' across all bins'}
          </Text>
          {selectedCategory !== 'ALL' && (
            <TouchableOpacity onPress={() => setSelectedCategory('ALL')}>
              <Text style={styles.resetFilterText}>Clear Filter</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🔎</Text>
      <Text style={styles.emptyTitle}>No matching items found</Text>
      <Text style={styles.emptySubtitle}>
        No groceries match your current filter. Try selecting "All Bins", changing
        your search, or add a custom item above.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.flatList}
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItemCard}
        ListHeaderComponent={renderHeader()}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
        bounces={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
    flexGrow: 1,
  },

  headerContainer: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  screenEmoji: {
    fontSize: 32,
    marginRight: 10,
  },
  titleTextWrapper: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  activeCategoryBanner: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  activeCategoryBannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeCategoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activeCategoryBannerEmoji: {
    fontSize: 28,
    marginRight: 10,
  },
  activeCategoryBannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  activeCategoryBannerDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  viewAllBtn: {
    backgroundColor: '#F2ECE0',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  viewAllBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  activeCategoryStatsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingTop: 8,
  },
  activeStatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  activeStatLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginRight: 4,
  },
  activeStatValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryCard: {
    width: '48.5%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  categoryCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryCardEmoji: {
    fontSize: 24,
  },
  categoryCountBadge: {
    backgroundColor: '#F3EFE0',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  categoryCardName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 2,
  },
  categoryCardSub: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '600',
  },

  horizontalPillScroll: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  navPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  navPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  navPillEmoji: {
    fontSize: 13,
    marginRight: 5,
  },
  navPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  navPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textMain,
    paddingVertical: 0,
  },
  searchClear: {
    color: COLORS.textMuted,
    fontSize: 14,
    paddingHorizontal: 4,
  },
  toggleFormBtn: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  toggleFormBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Custom Form
  customAddCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customAddTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textMain,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
    marginTop: 4,
  },
  customInput: {
    backgroundColor: '#FAF8F0',
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.textMain,
    marginBottom: 4,
  },
  inputError: {
    borderColor: COLORS.primary,
  },
  errorText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  categoryPillsScroll: {
    flexDirection: 'row',
    marginBottom: 8,
    marginTop: 2,
  },
  formCatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F0',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 6,
  },
  formCatPillSelected: {
    backgroundColor: COLORS.secondarySoft,
    borderColor: COLORS.secondary,
  },
  formCatPillEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  formCatPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  formCatPillTextSelected: {
    color: COLORS.secondary,
    fontWeight: '700',
  },
  formQtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  formQtyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  formQtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  formQtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  formQtyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  formQtyValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
    minWidth: 24,
    textAlign: 'center',
  },
  saveCustomBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  saveCustomBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.3,
  },

  // Storage Filter Tabs
  filterRow: {
    marginBottom: 8,
  },
  storageFilterTabs: {
    flexDirection: 'row',
    backgroundColor: '#EBE5D1',
    borderRadius: 10,
    padding: 3,
  },
  storageFilterTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
  },
  storageFilterTabActive: {
    backgroundColor: COLORS.cardBg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  storageFilterTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  storageFilterTabTextActive: {
    color: COLORS.textMain,
    fontWeight: '700',
  },

  // Results bar
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
    marginBottom: 2,
  },
  resultsCount: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  resultsCountBold: {
    fontWeight: '700',
    color: COLORS.textMain,
  },
  resetFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accent,
  },

  // Item Card
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  itemCardStored: {
    borderColor: '#D7E5DC',
    backgroundColor: '#FFFFFF',
  },
  itemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAF7EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ECE5D3',
  },
  itemIconContainerStored: {
    backgroundColor: COLORS.secondarySoft,
    borderColor: '#D4E6D8',
  },
  itemIconEmoji: {
    fontSize: 20,
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: '#F3EFE0',
    borderRadius: 6,
    paddingVertical: 1.5,
    paddingHorizontal: 5,
    marginRight: 5,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  measurementBadge: {
    backgroundColor: '#EFF5F2',
    borderRadius: 6,
    paddingVertical: 1.5,
    paddingHorizontal: 5,
    borderWidth: 0.5,
    borderColor: '#D4E6D8',
  },
  measurementBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3F6B42',
  },
  storageStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  inStorageBadge: {
    backgroundColor: COLORS.secondarySoft,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 6,
    marginBottom: 2,
  },
  inStorageBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  outOfStockBadge: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 6,
    marginBottom: 2,
  },
  outOfStockBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accent,
  },
  recentBoughtBadge: {
    backgroundColor: '#E7F5E9',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderWidth: 0.5,
    borderColor: COLORS.secondary,
    marginBottom: 2,
  },
  recentBoughtText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondary,
  },

  // Action Column
  actionColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  storageStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 2,
    paddingVertical: 2,
    marginBottom: 5,
  },
  stepperBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  stepperBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  stepperQtyBox: {
    alignItems: 'center',
    minWidth: 26,
  },
  stepperQtyText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  stepperQtyLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginTop: -2,
  },
  groceryAddBtn: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 7,
    alignItems: 'center',
    minWidth: 64,
  },
  groceryAddBtnDefault: {
    backgroundColor: COLORS.primary,
  },
  groceryAddBtnInList: {
    backgroundColor: COLORS.secondarySoft,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  groceryAddBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  groceryAddBtnTextDefault: {
    color: '#FFFFFF',
  },
  groceryAddBtnTextInList: {
    color: COLORS.secondary,
  },

  // Empty View
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderStyle: 'dashed',
    marginTop: 10,
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
