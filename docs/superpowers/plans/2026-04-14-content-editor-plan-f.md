# Content Editor — Plan F: Editor Polish & UX

**Goal:** Add undo/redo, keyboard shortcuts, block duplication, New button, unsaved changes warning, and toast notifications.

---

## Summary (4 Tasks)

### Task 1: Undo/Redo
- Track state history in a stack
- Ctrl+Z / Ctrl+Shift+Z keyboard shortcuts
- Undo/Redo buttons in header

### Task 2: Block duplication + New button
- Duplicate button on each block (copies block with new ID)
- "New" button in header that resets state with confirmation dialog

### Task 3: Unsaved changes warning
- beforeunload event to warn when navigating away with unsaved changes
- Track dirty state (changes since last save/load)

### Task 4: Toast notifications
- Auto-save confirmation toasts
- Publish success/error toasts
- Draft loaded toasts
- Replace alerts with toasts
