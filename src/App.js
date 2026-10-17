import React, { useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import {
  COLORS,
  CATEGORIES,
  INITIAL_GROCERIES,
  INITIAL_AVAILABLE_ITEMS,
} from './theme';
import GroceryList from './GroceryList';
import CategoriesList from './CategoriesList';

// Bottom Navigation Bar component
function BottomNavBar({ activeScreen, setActiveScreen, trackerCount }) {
  return (
    <View style={styles.navContainer}>
      <TouchableOpacity
        style={[
          styles.navTab,
          activeScreen === 'tracker' && styles.navTabActive,
        ]}
        onPress={() => setActiveScreen('tracker')}
        activeOpacity={0.7}
      >
        <View style={styles.tabIconWrapper}>
          <Text style={styles.navIcon}>🛒</Text>
          {trackerCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{trackerCount}</Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.navLabel,
            activeScreen === 'tracker' && styles.navLabelActive,
          ]}
        >
          Grocery List
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.navTab,
          activeScreen === 'categories' && styles.navTabActive,
        ]}
        onPress={() => setActiveScreen('categories')}
        activeOpacity={0.7}
      >
        <View style={styles.tabIconWrapper}>
          <Text style={styles.navIcon}>🗂️</Text>
        </View>
        <Text
          style={[
            styles.navLabel,
            activeScreen === 'categories' && styles.navLabelActive,
          ]}
        >
          Categories
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState('tracker');

  // Shared Grocery Tracker list state
  const [items, setItems] = useState(INITIAL_GROCERIES);
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [errorMsg, setErrorMsg] = useState('');

  // Shared Storage Categories inventory state
  const [storageItems, setStorageItems] = useState(INITIAL_AVAILABLE_ITEMS);

  // Helper to normalize strings for robust name matching
  const normalize = (text) =>
    (text || '')
      .toLowerCase()
      .replace(/\(.*?\)/g, '')
      .replace(/[^a-z0-9]/g, ' ')
      .trim();

  // Find matching storage item for a grocery list item
  const findStorageMatch = (storageList, groceryItem) => {
    if (groceryItem.catalogItemId) {
      const direct = storageList.find((si) => si.id === groceryItem.catalogItemId);
      if (direct) return direct;
    }

    const gName = normalize(groceryItem.name);
    const gCategory = (groceryItem.category || '').toLowerCase();

    const exactCat = storageList.find(
      (si) =>
        si.category.toLowerCase() === gCategory &&
        normalize(si.name) === gName
    );
    if (exactCat) return exactCat;

    const subCat = storageList.find(
      (si) =>
        si.category.toLowerCase() === gCategory &&
        (normalize(si.name).includes(gName) || gName.includes(normalize(si.name)))
    );
    if (subCat) return subCat;

    const exactAny = storageList.find((si) => normalize(si.name) === gName);
    if (exactAny) return exactAny;

    const subAny = storageList.find(
      (si) => normalize(si.name).includes(gName) || gName.includes(normalize(si.name))
    );
    return subAny || null;
  };

  // Add new item from input card
  const handleAddItem = () => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      setErrorMsg('Please enter an item name first!');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      name: trimmed,
      category: selectedCategory.name,
      categoryIcon: selectedCategory.icon,
      quantity: quantity,
      completed: false,
    };

    setItems((prev) => [newItem, ...prev]);
    setInputText('');
    setQuantity(1);
    setErrorMsg('');
    Keyboard.dismiss();
  };

  // Add item from categories page to grocery list
  const handleAddFromCatalog = ({ id, name, category, categoryIcon, quantity = 1, measurement = '' }) => {
    const existingIndex = items.findIndex(
      (item) => item.name.toLowerCase() === name.toLowerCase() && !item.completed
    );

    if (existingIndex !== -1) {
      setItems((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      const newItem = {
        id: Date.now().toString(),
        catalogItemId: id,
        name: name,
        category,
        categoryIcon,
        quantity,
        measurement,
        completed: false,
      };
      setItems((prev) => [newItem, ...prev]);
    }
  };

  // Toggle item completion: when bought, auto-adds quantity to storage!
  const handleToggleComplete = (id) => {
    const targetItem = items.find((item) => item.id === id);
    if (!targetItem) return;

    const willBeCompleted = !targetItem.completed;
    const qtyChange = willBeCompleted ? targetItem.quantity : -targetItem.quantity;

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: willBeCompleted } : item
      )
    );

    setStorageItems((prevStorage) => {
      const match = findStorageMatch(prevStorage, targetItem);

      if (match) {
        return prevStorage.map((si) => {
          if (si.id === match.id) {
            const updatedQty = Math.max(0, (si.inStorageQty || 0) + qtyChange);
            return {
              ...si,
              inStorageQty: updatedQty,
              lastBoughtQty: willBeCompleted ? targetItem.quantity : undefined,
            };
          }
          return si;
        });
      } else {
        if (willBeCompleted) {
          const newStorageItem = {
            id: `storage-bought-${Date.now()}-${targetItem.id}`,
            name: targetItem.name,
            category: targetItem.category || 'Pantry',
            categoryIcon: targetItem.categoryIcon || '🥫',
            icon: targetItem.categoryIcon || '📦',
            measurement: targetItem.measurement || `${targetItem.quantity} pcs`,
            measurementUnit: 'units',
            inStorageQty: targetItem.quantity,
            storageTip: `Purchased and stocked in ${targetItem.category || 'Pantry'} bin`,
            lastBoughtQty: targetItem.quantity,
          };
          return [newStorageItem, ...prevStorage];
        }
        return prevStorage;
      }
    });
  };

  // Delete item from grocery list
  const handleDeleteItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Update item quantity in grocery list
  const handleUpdateQty = (id, delta) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          if (item.completed) {
            setStorageItems((prevStorage) => {
              const match = findStorageMatch(prevStorage, item);
              if (match) {
                return prevStorage.map((si) => {
                  if (si.id === match.id) {
                    const updatedStorageQty = Math.max(0, (si.inStorageQty || 0) + delta);
                    return { ...si, inStorageQty: updatedStorageQty };
                  }
                  return si;
                });
              }
              return prevStorage;
            });
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // Clear completed items from grocery list
  const handleClearCompleted = () => {
    setItems((prev) => prev.filter((item) => !item.completed));
  };

  // Manual update of storage quantity directly in CategoriesList
  const handleUpdateStorageQty = (itemId, delta) => {
    setStorageItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQty = Math.max(0, (item.inStorageQty || 0) + delta);
          return { ...item, inStorageQty: newQty };
        }
        return item;
      })
    );
  };

  // Delete item from storage categories (via long-press)
  const handleDeleteStorageItem = (itemId) => {
    setStorageItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Add custom storage item directly in CategoriesList
  const handleAddCustomStorageItem = (newItem) => {
    setStorageItems((prev) => [newItem, ...prev]);
  };

  const pendingCount = items.filter((i) => !i.completed).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.neutralBg} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.screenWrapper}>
          {activeScreen === 'tracker' ? (
            <GroceryList
              items={items}
              inputText={inputText}
              setInputText={setInputText}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              quantity={quantity}
              setQuantity={setQuantity}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              errorMsg={errorMsg}
              setErrorMsg={setErrorMsg}
              onAddItem={handleAddItem}
              onToggleComplete={handleToggleComplete}
              onDeleteItem={handleDeleteItem}
              onUpdateQty={handleUpdateQty}
              onClearCompleted={handleClearCompleted}
            />
          ) : (
            <CategoriesList
              storageItems={storageItems}
              onUpdateStorageQty={handleUpdateStorageQty}
              onAddCustomItem={handleAddCustomStorageItem}
              onDeleteStorageItem={handleDeleteStorageItem}
              groceryItems={items}
              onAddGroceryItem={handleAddFromCatalog}
            />
          )}

          <BottomNavBar
            activeScreen={activeScreen}
            setActiveScreen={setActiveScreen}
            trackerCount={pendingCount}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.neutralBg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  screenWrapper: {
    flex: 1,
  },
  navContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.cardBorder,
    paddingVertical: 8,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 8,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: 12,
  },
  navTabActive: {
    backgroundColor: '#FAF5E8',
  },
  tabIconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  navIcon: {
    fontSize: 22,
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: COLORS.primary,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  navLabelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
});
