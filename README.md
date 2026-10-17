# 🍅 BinBuddy — Kitchen & Pantry Grocery Tracker

**BinBuddy** is an interactive, two-page React Native grocery and kitchen pantry tracker built for **Activity 3: User Input and FlatList**. It helps users manage grocery items needed for their **Fridge**, **Pantry**, **Produce**, and **Freezer** with a vibrant farmers market visual identity.

---

## 🎨 Color Palette: Vibrant Farmers Market
- **Primary (Tomato Red)**: `#B93636` — Add buttons, active urgency badges, and action triggers.
- **Secondary (Tropical Green)**: `#7D9C65` & `#9FC9A9` — Stocked checkmarks, progress fill, and in-stock badges.
- **Accent (Warm Coral)**: `#F16B44` — Category selector highlights and needed tags.
- **Neutral (Light Gray / Beige)**: `#F8F3E1` — App background canvas and subtle borders.

---

## 🔄 Automatic Grocery-to-Storage Synchronization

When items are bought in the **Grocery List**, their bought count automatically transfers to the **Categories** inventory:

1. **Mark as Bought (`✓`)**:
   - Tapping an item on the Grocery List marks it as bought.
   - The exact bought quantity (`item.quantity`) is immediately added to that item's `inStorageQty` on the **Categories** page.
   - Visual row badge confirms: `✓ Bought (+2 to Produce)`.
2. **Catalog & Custom Matching**:
   - Pre-existing catalog items (e.g., Milk, Eggs, Avocados, Rice) increment their in-storage stock count and total category units.
   - Brand new custom items typed by the user are automatically registered as new storage items under that category.
3. **Un-checking / Quantity Adjustments**:
   - If an item is unchecked, the quantity is safely deducted.
   - If a bought item's quantity is incremented or decremented (`+` / `-`), the storage count updates in sync.
4. **Persistent Storage Inventory**:
   - Tapping `Clear Stocked` removes completed rows from your grocery shopping receipt while keeping their added numbers intact in the kitchen storage bins.

---

## 📱 App Pages & Features

### 1. 🛒 Grocery List (`TrackerScreen.js`)
- `<TextInput>` to add custom grocery items with validation.
- Stepper counter (`-` / `+`) to set item quantity.
- Storage category chips to organize items by bin.
- High-performance `<FlatList>` with toggle checkboxes (`✓`), completed strikethrough, item quantity adjustments, and direct delete (`✕`).
- Progress bar displaying the percentage of stocked items.
- Filter tabs: `All`, `To Buy`, and `Stocked`, plus a `Clear Stocked` action.

### 2. 🗂️ Categories & Storage Catalog (`CategoriesScreen.js`)
- **Smooth, uninhibited scrolling**: Screen layout optimized with proper clearance above bottom navigation (`paddingBottom: 110`, `flexGrow: 1`) and gesture-friendly responders.
- **In-Storage Inventory & Counts**:
  - Displays the exact number of items stored in each kitchen bin.
  - Interactive inline stepper (`-` / `+`) directly on each row to adjust physical storage counts in real time.
- **Specific Measurements & Units**:
  - Every item displays its specific measurement (e.g., `1L carton`, `1 dozen (12 pcs)`, `400g can`, `750ml glass bottle`, `500g tub`, `2kg bag`, etc.).
- **Storage Status Indicators**:
  - `📦 In Storage: X units` in Tropical Green (`#7D9C65`).
  - `⚠️ 0 in storage (Out of Stock)` in Warm Coral (`#F16B44`).
  - `+X bought` badge indicating recently purchased items from the Grocery List.
- **Storage Filter Tabs**:
  - `All Items`: Browse everything available.
  - `📦 In Storage`: Show only items currently physically stored in the kitchen.
  - `⚠️ Need Restock`: Show only items that are empty / out of stock.
- **Connected Quick Add**:
  - Tap `+ Buy List` on any storage item to instantly send it to the Grocery Tracker.
- **Long-Press to Delete**:
  - Press and hold on any item card in the Categories page to prompt a confirmation dialog and permanently delete the item from kitchen storage.

---

## 📁 Project Structure (`src/`) — Flat & Compressed

All application code has been compressed directly into `src/` without any subfolders:

```
src/
├── App.js                      # Root container, shared state synchronization & bottom navigation
├── GroceryList.js              # Grocery Tracker list: TextInput, Add button, FlatList, check-off, & delete
├── CategoriesList.js           # Categories & Storage: Storage bins, available items, measurements, & long-press delete
└── theme.js                    # Farmers market color palette & Philippine grocery items catalog
```

---

## 🚀 How to Run the App

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Scan the QR code using the **Expo Go** app on your iOS/Android device, or press:
   - `a` to open Android emulator
   - `i` to open iOS simulator
   - `w` to open in your web browser
