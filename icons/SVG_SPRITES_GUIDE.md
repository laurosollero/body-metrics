# 🎨 SVG Sprites Guide for BodyMetrics

SVG sprites provide professional, scalable icons throughout the app instead of emoji. All icons are derived from the original source-icons.svg created by Claude Chat.

## 🚀 How to Use SVG Icons

### Method 1: HTML Data Attributes (Recommended)
```html
<!-- Basic icon -->
<span data-icon="dashboard" data-size="24"></span>

<!-- Icon with custom class -->
<span data-icon="weight" data-size="32" class="my-custom-class"></span>
```

### Method 2: JavaScript Helper
```javascript
// Create icon element
const icon = Utils.createIcon('charts', 24, 'icon-class');
document.body.appendChild(icon);

// Get icon HTML string
const iconHTML = Utils.getIconHTML('profile', 20);
element.innerHTML = iconHTML;
```

### Method 3: Direct SVG Reference
```html
<svg width="24" height="24" viewBox="0 0 80 80" fill="currentColor">
    <use href="#icon-dashboard"></use>
</svg>
```

## 📋 Available Icons

| Icon Name | Use Case | Description |
|-----------|----------|-------------|
| `dashboard` | Navigation, overview | Grid-based dashboard icon |
| `add` | Actions, forms | Plus symbol in circle |
| `charts` | Analytics, trends | Line chart with data points |
| `profile` | User settings | Person silhouette |
| `weight` | Body metrics | Scale with measurement display |
| `bodyfat` | Body composition | Circle with percentage symbol |
| `muscle` | Body composition | Stylized muscle shapes |
| `water` | Body composition | Water drop shape |
| `export` | Data management | Document with up arrow |
| `import` | Data management | Document with down arrow |
| `target` | Goals, objectives | Bullseye target symbol |
| `notification` | Alerts, reminders | Bell with notification dot |
| `delete` | Actions, cleanup | Trash can symbol |

## 🎯 Implementation Details

### Icon Sprite Location
```
/icons/sprite.svg - External sprite file (not used)
HTML <defs> section - Inline sprite (currently used)
```

### CSS Styling
Icons inherit color from their parent element using `currentColor`:

```css
.nav-icon {
    color: #2563eb; /* Icons will be blue */
}

.icon-red {
    color: #ef4444; /* Icons will be red */
}
```

### Size Guidelines
- **Navigation**: 20px
- **Buttons**: 16px  
- **Cards/Headers**: 24px
- **Large Display**: 32px+
- **Hero/Empty States**: 48px+

## 🔄 Icon Replacement Process

The app automatically replaces `data-icon` attributes with SVG elements on initialization:

1. **Page Load**: `initIcons()` called during app initialization
2. **DOM Scan**: `Utils.replaceIconsInElement()` finds all `[data-icon]` elements
3. **SVG Creation**: Each element replaced with proper SVG markup
4. **Attribute Copying**: Classes and other attributes preserved

## ✨ Benefits Over Emoji

| Aspect | Emoji | SVG Sprites |
|--------|-------|-------------|
| **Consistency** | Varies by platform | Identical everywhere |
| **Scalability** | Pixelated at large sizes | Crisp at any size |
| **Customization** | Fixed colors | CSS controllable |
| **Performance** | Individual characters | Single sprite file |
| **Accessibility** | Screen reader issues | Proper semantic markup |
| **Professional Look** | Casual/fun | Clean/professional |

## 🛠️ Adding New Icons

1. **Create Symbol**: Add new `<symbol>` to HTML sprite section
2. **Unique ID**: Use pattern `icon-{name}`
3. **ViewBox**: Keep consistent `0 0 80 80` viewBox
4. **Current Color**: Use `currentColor` for fills/strokes
5. **Documentation**: Update this guide with new icon

Example new icon:
```html
<symbol id="icon-calendar" viewBox="0 0 80 80">
    <rect x="15" y="20" width="50" height="45" rx="4" fill="none" stroke="currentColor" stroke-width="2"/>
    <line x1="25" y1="15" x2="25" y2="25" stroke="currentColor" stroke-width="2"/>
    <line x1="55" y1="15" x2="55" y2="25" stroke="currentColor" stroke-width="2"/>
</symbol>
```

## 🎨 Design Principles

- **Minimalist**: Clean, simple shapes
- **Consistent**: Same stroke width (2px) and style
- **Recognizable**: Clear at small sizes
- **Accessible**: High contrast, clear meaning
- **Scalable**: Vector-based, resolution independent

## 🔍 Troubleshooting

**Icons not showing?**
- Check console for JavaScript errors
- Verify `data-icon` attribute spelling
- Ensure sprite symbols are loaded in HTML

**Icons wrong color?**
- Check parent element CSS `color` property
- Verify `currentColor` is used in SVG fills/strokes

**Icons blurry?**
- Use integer pixel sizes (16, 24, 32)
- Avoid fractional scaling

**Performance issues?**
- Icons load once with page, no additional requests
- Sprite system is highly optimized for performance