import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { COLORS, CATEGORIES } from './theme';

export default function GroceryList({
  items,
  inputText,
  setInputText,
  selectedCategory,
  setSelectedCategory,
  quantity,
  setQuantity,
  activeFilter,
  setActiveFilter,
  errorMsg,
  setErrorMsg,
  onAddItem,
  onToggleComplete,
  onDeleteItem,
  onUpdateQty,
  onClearCompleted,
}) {
  // Filter items based on active tab
  const filteredItems = items.filter((item) => {
    if (activeFilter === 'ACTIVE') return !item.completed;
    if (activeFilter === 'DONE') return item.completed;
    return true;
  });

  // Calculate statistics
  const totalCount = items.length;
  const completedCount = items.filter((i) => i.completed).length;
  const remainingCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Render individual grocery item row
  const renderItem = ({ item }) => {
    return (
      <View style={[styles.itemCard, item.completed && styles.itemCardCompleted]}>
        {/* Toggle Checkbox Button */}
        <TouchableOpacity
          style={[styles.checkbox, item.completed && styles.checkboxCompleted]}
          onPress={() => onToggleComplete(item.id)}
          activeOpacity={0.7}
        >
          {item.completed && <Text style={styles.checkIcon}>✓</Text>}
        </TouchableOpacity>

        {/* Item Info (Name, Category & Status Badges) */}
        <TouchableOpacity
          style={styles.itemInfo}
          onPress={() => onToggleComplete(item.id)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.itemName,
              item.completed && styles.itemNameCompleted,
            ]}
            numberOfLines={2}
          >
            {item.name}
          </Text>

          <View style={styles.itemMetaRow}>
            {/* Category Tag */}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {item.categoryIcon} {item.category}
              </Text>
            </View>

            {/* Status Indicator */}
            {item.completed ? (
              <View style={styles.inStockBadge}>
                <Text style={styles.inStockText}>
                  ✓ Bought (+{item.quantity} to {item.category})
                </Text>
              </View>
            ) : (
              <View style={styles.needBadge}>
                <Text style={styles.needText}>Needed</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Quantity Controls */}
        <View style={styles.qtyControlContainer}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => onUpdateQty(item.id, -1)}
            activeOpacity={0.6}
          >
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyCountText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => onUpdateQty(item.id, 1)}
            activeOpacity={0.6}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDeleteItem(item.id)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render header with stats, input card, and filter bar
  const renderHeader = () => (
    <View style={styles.headerWrapper}>
      {/* App Logo & Stats Banner */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.logoEmoji}>🍅</Text>
          <View>
            <Text style={styles.appTitle}>BinBuddy</Text>
            <Text style={styles.appSubtitle}>Kitchen & Pantry Grocery Tracker</Text>
          </View>
        </View>

        {/* Dynamic Summary Stat Pills */}
        <View style={styles.headerStatsRow}>
          <View style={[styles.statPill, styles.statPillTotal]}>
            <Text style={styles.statPillLabel}>Total</Text>
            <Text style={styles.statPillValue}>{totalCount}</Text>
          </View>
          <View style={[styles.statPill, styles.statPillNeeded]}>
            <Text style={styles.statPillLabel}>Need</Text>
            <Text style={styles.statPillValueNeeded}>{remainingCount}</Text>
          </View>
          <View style={[styles.statPill, styles.statPillStocked]}>
            <Text style={styles.statPillLabel}>Stocked</Text>
            <Text style={styles.statPillValueStocked}>{completedCount}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercent}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progressPercent)}% stocked
            </Text>
          </View>
        )}
      </View>

      {/* Input Card for Adding Items */}
      <View style={styles.inputCard}>
        <Text style={styles.inputCardLabel}>Add New Grocery Item</Text>

        {/* Text Input Row with Quantity Stepper */}
        <View style={styles.textInputRow}>
          <TextInput
            style={[styles.textInput, errorMsg ? styles.textInputError : null]}
            placeholder="e.g., Sinandomeng Rice, Corned Beef, Pandesal..."
            placeholderTextColor="#A8A89A"
            value={inputText}
            onChangeText={(text) => {
              setInputText(text);
              if (errorMsg) setErrorMsg('');
            }}
            returnKeyType="done"
            onSubmitEditing={onAddItem}
          />

          {/* Stepper Quantity for next item */}
          <View style={styles.inputQtyStepper}>
            <TouchableOpacity
              style={styles.inputQtyBtn}
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              activeOpacity={0.6}
            >
              <Text style={styles.inputQtyBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.inputQtyValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.inputQtyBtn}
              onPress={() => setQuantity((q) => q + 1)}
              activeOpacity={0.6}
            >
              <Text style={styles.inputQtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {errorMsg ? <Text style={styles.errorMessage}>{errorMsg}</Text> : null}

        {/* Storage Category Selection Chips */}
        <Text style={styles.sectionSmallLabel}>Store in:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.id === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catChip,
                  isSelected && styles.catChipSelected,
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={styles.catChipEmoji}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.catChipText,
                    isSelected && styles.catChipTextSelected,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Primary Call to Action Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddItem}
          activeOpacity={0.85}
        >
          <Text style={styles.addButtonText}>➕ Add to Grocery List</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs and Quick Action */}
      <View style={styles.filterSection}>
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === 'ALL' && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter('ALL')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === 'ALL' && styles.filterTabTextActive,
              ]}
            >
              All ({totalCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === 'ACTIVE' && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter('ACTIVE')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === 'ACTIVE' && styles.filterTabTextActive,
              ]}
            >
              To Buy ({remainingCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === 'DONE' && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter('DONE')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === 'DONE' && styles.filterTabTextActive,
              ]}
            >
              Stocked ({completedCount})
            </Text>
          </TouchableOpacity>
        </View>

        {completedCount > 0 && (
          <TouchableOpacity
            style={styles.clearDoneBtn}
            onPress={onClearCompleted}
            activeOpacity={0.7}
          >
            <Text style={styles.clearDoneText}>Clear Stocked</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Render empty state view
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🧺</Text>
      <Text style={styles.emptyTitle}>
        {activeFilter === 'DONE'
          ? 'No items marked as stocked yet'
          : activeFilter === 'ACTIVE'
          ? 'All pantry items are stocked!'
          : 'Your kitchen bin is empty!'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeFilter === 'ALL'
          ? 'Add your fresh produce, dairy, and snacks using the form above.'
          : 'Switch filters or tap items to check them off.'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader()}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 110,
    flexGrow: 1,
  },
  headerWrapper: {
    paddingTop: 8,
  },

  // Header styles
  header: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoEmoji: {
    fontSize: 34,
    marginRight: 10,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  headerStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statPill: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginHorizontal: 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  statPillTotal: {
    backgroundColor: '#FAF7F0',
  },
  statPillNeeded: {
    backgroundColor: COLORS.accentSoft,
    borderColor: '#F8D8CE',
  },
  statPillStocked: {
    backgroundColor: COLORS.secondarySoft,
    borderColor: '#D4E6D8',
  },
  statPillLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  statPillValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  statPillValueNeeded: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.accent,
  },
  statPillValueStocked: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  progressBarTrack: {
    flex: 1,
    height: 7,
    backgroundColor: '#E6E0CB',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  // Input Card
  inputCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 12,
  },
  inputCardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#FAF8F0',
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 15,
    color: COLORS.textMain,
  },
  textInputError: {
    borderColor: COLORS.primary,
  },
  errorMessage: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 4,
  },
  inputQtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F0',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    marginLeft: 8,
    paddingHorizontal: 4,
    paddingVertical: 5,
  },
  inputQtyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  inputQtyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  inputQtyValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
    minWidth: 18,
    textAlign: 'center',
  },
  sectionSmallLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 8,
    marginBottom: 6,
  },
  categoryScroll: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F0',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 18,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 6,
  },
  catChipSelected: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accent,
  },
  catChipEmoji: {
    fontSize: 13,
    marginRight: 4,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  catChipTextSelected: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Filter Bar
  filterSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#EBE5D1',
    borderRadius: 10,
    padding: 3,
  },
  filterTab: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: COLORS.cardBg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  filterTabTextActive: {
    color: COLORS.textMain,
    fontWeight: '700',
  },
  clearDoneBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  clearDoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // List Item Cards
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  itemCardCompleted: {
    backgroundColor: '#F7FCF8',
    borderColor: '#CDE5D4',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  checkboxCompleted: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  itemNameCompleted: {
    color: COLORS.textStrikethrough,
    textDecorationLine: 'line-through',
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  categoryBadge: {
    backgroundColor: '#F3EFE0',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 6,
    marginBottom: 2,
  },
  categoryBadgeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  needBadge: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginBottom: 2,
  },
  needText: {
    fontSize: 10,
    color: COLORS.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  inStockBadge: {
    backgroundColor: COLORS.secondarySoft,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderWidth: 0.5,
    borderColor: COLORS.secondary,
    marginBottom: 2,
  },
  inStockText: {
    fontSize: 10,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  qtyControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F1E1',
    borderRadius: 8,
    paddingHorizontal: 2,
    paddingVertical: 2,
    marginRight: 8,
  },
  qtyBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  qtyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  qtyCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMain,
    minWidth: 16,
    textAlign: 'center',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FBEBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
  },

  // Empty View
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
