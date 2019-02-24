---
title: test.vue
---

# test.vue

# test 

- **vue** 

## data 

- `isNavigationLocked` 

**initial value:** `false` 

## computed properties 

- `isNavigationVisible` 

   **dependencies:** `$store` 

- `isEndNavigationModalVisible` 

   **dependencies:** `$store` 

- `activeSection` 

   **dependencies:** `$store` 

- `activeSubSection` 

   **dependencies:** `$store` 

- `sections` 

   **dependencies:** `$sections` 

- `sectionsWithoutProfiSubviews` 

   **dependencies:** `$sectionsWithoutProfiSubviews` 


## methods 

- `formatSubViewNumber(index)` 

- `calcProgressbarWidth()` 

- `resetActiveSubsection()` 

- `resetNavigation()` 

- `toggleNav()` 

- `toggleCloseNavigationModal()` 

- `setActiveSection(index)` 

  **parameters:** 

     - `index` **Number** - Number of the section to display 

- `setActiveSubSection(index)` 

  **parameters:** 

     - `index` **Number** - Number of the subsection to display 

- `nextSubsection()` 

  Navigate to the next subsection 

- `previousSubsection()` 

  Navigate to the prevoius subsection 

