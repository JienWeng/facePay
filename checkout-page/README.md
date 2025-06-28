# FacePay Checkout Page

This is a standalone checkout page built with Tailwind CSS featuring **FaceID Express Checkout**.

## 🚀 New Feature: FaceID Express Checkout

Experience the future of payments with our biometric authentication system:

1. **Click "Pay with Face ID"** - Starts the authentication process
2. **Face Scanning** - Camera opens to scan your face (requires camera permission)
3. **Identity Verification** - System identifies you as "Lai Jien Weng"
4. **Phone Notification** - Simulated iPhone 12 push notification appears
5. **Payment Confirmation** - Click "Confirm" to complete the payment
6. **Success** - Payment completed with transaction ID

### How to Test FaceID:
1. Open the checkout page
2. Click the blue "Pay with Face ID" button in the express checkout card
3. Grant camera permission when prompted
4. Click "Start Face Scan"
5. Watch the progress bar complete the face scanning simulation
6. See your name "Lai Jien Weng" appear after verification
7. Click "Confirm" on the simulated iPhone notification
8. See the success message with transaction details

## Quick Start (Using CDN - Current Setup)

The `index.html` file is currently set up to use Tailwind CSS via CDN, so you can:

1. **Simply open the file in your browser:**
   ```bash
   open index.html
   ```

2. **Or serve it with a local server:**
   ```bash
   # If you have Python installed
   python3 -m http.server 3001
   
   # Or if you have Node.js installed
   npx live-server --port=3001
   ```

## Professional Setup (Recommended for Production)

For a more professional setup with compiled CSS:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build Tailwind CSS:**
   ```bash
   npm run build-css
   ```

3. **Update the HTML to use compiled CSS:**
   Replace the CDN script tags in `index.html` with:
   ```html
   <link rel="stylesheet" href="./dist/output.css">
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Current Setup

✅ **Working Now**: The page uses Tailwind CSS CDN for immediate use  
✅ **All Tailwind classes**: Fully functional with your custom config  
✅ **Custom colors**: Primary color palette included  
✅ **Dark mode**: Ready to use (add `dark` class to html tag)  
✅ **Responsive**: Mobile-first design  
✅ **FaceID Authentication**: Complete biometric payment flow  
✅ **Camera Integration**: Real camera access for face scanning  
✅ **Push Notification Simulation**: iPhone 12 notification mockup  

## File Structure

```
checkout-page/
├── index.html          # Main checkout page (ready to use)
├── index-compiled.html # Alternative with compiled CSS
├── tailwind.config.js  # Tailwind configuration
├── package.json        # Development dependencies
├── src/
│   └── input.css      # Source CSS for compilation
└── dist/
    └── output.css     # Compiled CSS (generated)
```

## Features

- **🎯 FaceID Express Checkout** - Revolutionary biometric payment
- Complete checkout form with validation
- Payment method selection
- Delivery options
- Order summary
- Responsive design
- Dark mode support
- Custom primary color theme
- **📱 Mobile notification simulation**
- **📹 Real camera integration**
- **🔒 Secure authentication flow**

## FaceID Technical Details

### Security Features:
- Camera permission required
- Real-time face scanning simulation
- Multi-step verification process
- Push notification confirmation
- Transaction ID generation

### Browser Compatibility:
- Chrome/Safari/Firefox (camera API support required)
- HTTPS required for camera access in production
- Mobile responsive design

### Flow Steps:
1. Express checkout card display
2. Modal-based authentication
3. Camera stream initialization
4. Progress tracking
5. Identity confirmation
6. Phone notification simulation
7. Payment confirmation
8. Success feedback

## How to Test

1. Open `index.html` in your browser
2. The page should display with full Tailwind styling
3. **Try the FaceID feature** by clicking "Pay with Face ID"
4. Grant camera permission when prompted
5. Experience the complete authentication flow
6. Try resizing the browser to test responsiveness
7. Toggle dark mode by adding `class="dark"` to the `<html>` tag

## Demo Flow

**Step 1:** Click "Pay with Face ID" button  
**Step 2:** Face scanning with camera (4-second simulation)  
**Step 3:** Identity confirmed as "Lai Jien Weng"  
**Step 4:** iPhone 12 notification appears  
**Step 5:** Click "Confirm" to complete payment  
**Step 6:** Success message with transaction ID
