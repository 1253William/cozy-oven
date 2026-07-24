# Cozy Oven Website Training

A simple guide for updating the website yourself — no coding needed.

---

## What you can do now

1. **Edit the homepage** (headlines, buttons, promo bar, which sections show)
2. **Create special pages** (Mother’s Day, sales, campaigns)
3. **Put products on sale** (sale price + optional start/end dates)

Everything lives in **Admin**. Log in the same way you always do.

---

## Part 1 — Homepage (Website → Home)

### Open it

1. Go to **Admin**
2. Click **Website** in the side menu
3. Stay on the **Home** tab

You’ll see a list of homepage “blocks” (sections), like cards in a stack.

### What each block is

| Block | What it controls |
|---|---|
| **Promo bar** | Thin black message at the very top (optional) |
| **Hero** | Big opening message + main buttons |
| **Featured product** | The product card in the hero area |
| **Favourites** | The product row (“customer favourites”) |
| **Gift box** | The dark gift / package section |
| **FAQs** | The FAQ heading on the home page |
| **Newsletter** | The email signup section at the bottom |

### Show or hide a block

- Click the **eye** icon on a card
- Hidden blocks won’t appear on the live site
- Tip: turn **Promo bar** off when you’re not running a promo

### Change the order

- Use the **↑** and **↓** buttons
- The live homepage will follow that order (the featured product still sits inside the hero)

### Edit the words / links / image

1. Click **Edit** on a card
2. Change the fields (headline, text, button label, link, etc.)
3. For images: click **Upload image** (or **Replace image**) and pick a photo from your phone/computer — same idea as product photos
4. Close the editor
5. Click **Save** at the top

**Important:** edits are not live until you hit **Save**.

### Images (homepage + pages)

- Use **Upload image** — no need to paste a link
- Supported: JPEG, PNG, or WebP
- Keep files under about **5MB**
- You can **Remove** an image with the red X, then upload a new one
- After uploading on the homepage, still click the main **Save** button so the change sticks

### Promo bar dates

On the promo bar, you can set:

- **Starts** — when it should begin showing
- **Ends** — when it should stop

Leave them empty if you want it on whenever the promo bar is visible.

### Favourites category (optional)

On **Favourites**, you can set a **Category** (for example `banana bread`).

- If set, that row tries to show products from that category
- If nothing matches, it falls back to normal favourites

### Featured product ID (optional)

On **Featured product**, you can paste a **Product ID**.

- That product is preferred for the featured card
- If blank or not found, the site picks a sensible default

How to get a Product ID: open the product in Admin → Products (or from the product page URL — the long code after `/product/`).

---

## Part 2 — New pages (Website → Pages)

Use this for things like:

- Mother’s Day landing page
- A weekend sale page
- A special gift campaign

Pages are built from **sections** (same idea as the homepage), and you can **add** sections from a list.

### Create a page

1. Go to **Website → Pages**
2. Click **New page**
3. Fill in:

| Field | Meaning |
|---|---|
| **Title** | Name of the page (for you + the site) |
| **Slug** | The web address piece — fills in automatically from the title (you can still edit it) |
| **Starter preset** | Seeds a starting set of sections: **Simple**, **Seasonal**, or **Promo** (you can change sections after) |
| **Status** | **Draft** (only you) or **Published** (live) |
| **SEO title / description** | What Google / link previews can use |
| **Publish at / Unpublish at** | Optional schedule |

4. Under **Sections**, click **Add section** to pick a block (Hero, Story + image, Product strip, Values chips, Closing note, etc.)
5. Use **↑ / ↓**, the eye icon, **Edit**, or trash on each section
6. Click **Save**

**Tip:** Changing the starter preset replaces the current sections — only do that when you want a fresh start.

### Section types you can add

| Section | Typical use |
|---|---|
| **Hero** | Big opening with buttons + image |
| **Text intro** | Centered headline + paragraphs (About-style) |
| **Story + image** | Photo beside text (image left or right) |
| **Feature grid** | Dark band with a list of points |
| **Values chips** | Round labels in a row |
| **Product strip** | Hand-picked products, category filter, and/or on-sale products |
| **Gift box / Featured / Promo / FAQs / Newsletter** | Same styles as the homepage |
| **Closing note** | Signed thank-you / closing message |

### Draft vs Published

- **Draft** = not on the public site yet (safe to edit)
- **Published** = live at `yoursite.com/pages/your-slug`

You can switch back to Draft anytime to take it offline.

### Edit, preview, copy link, history, or delete

On each page card:

- **Copy link** — copies the public page URL (share after it’s published)
- **Preview** — opens a preview of the saved page (works for drafts too)
- **History** — see recent saves and restore an older version if something went wrong
- **Edit** — opens the form
- Trash icon — deletes the page (ask yourself once before confirming)

While editing (including a **new** unsaved page):

- **Preview page** — shows the whole page with your current edits (no need to save first)
- **Preview** on a section — shows just that block
- While editing a section’s fields, use **Preview** to check it before clicking Done

### Undo with History

Every time you **Save** an existing page, the previous version is kept.

- You can go back up to the **last 10 saves**
- Older ones are removed automatically (keeps the database light)
- Restoring also saves your current page first, so you can undo a restore too

### Share a page

After it’s published, use **Copy link**, or share:

`https://cozyoven.store/pages/mothers-day`

(Use your real slug.)

### Tip: slug from title

Type the title first. The slug fills itself (`Mother’s Day` → `mothers-day`).  
Only edit the slug if you want a custom link.

---

## Part 3 — Product sales

You don’t need a special page just to discount one product.

### Set a sale on a product

1. Go to **Admin → Products**
2. Add or edit a product
3. Find:

- **Sale price (GHS)**
- **Sale starts**
- **Sale ends**

4. Save the product

### How it looks to customers

- They see the old price crossed out
- The sale price is shown instead
- Checkout uses the sale price too (so what they see is what they pay)

### Tips

- Leave sale price empty when the product is full price again
- Dates are optional — empty dates = sale is on as long as a sale price is set
- Works for products with sizes too

---

## Quick recipes

### “I want a top banner for this weekend only”

1. Website → Home → Promo bar → Edit  
2. Write the message + optional button link  
3. Set Starts / Ends  
4. Make sure the eye is **on**  
5. **Save**

### “I want a Mother’s Day page”

1. Website → Pages → New page  
2. Template: Seasonal  
3. Title: Mother’s Day (slug fills in)  
4. Add headline, story, upload an image, button to `/shop`  
5. Add products with the search picker  
6. Status: **Published** → Save  
7. **Copy link** and share  
8. Use **Preview** anytime to check how it looks

### “I accidentally ruined a page — undo”

1. Website → Pages  
2. Click **History** on that page  
3. Find the save from before the mistake  
4. Click **Restore**  
5. Confirm — your current version is kept in history too  
6. **Preview** to check it looks right again

### “Banana bread is 10 cedis off this week”

1. Products → edit the product  
2. Set Sale price  
3. Set start/end if you want  
4. Save  

---

## Good habits

- Always click **Save** after homepage changes
- Keep promo bar **off** when there’s no promo (cleaner homepage)
- Use **Draft** while you’re still writing a page
- **Preview** before you publish
- Use **History** instead of rewriting from scratch if something looks wrong
- Double-check links (`/shop`, `/product/...`, `/pages/...`)
- If something looks wrong on the site, hard-refresh the page (or try another browser tab)

---

## If something feels stuck

1. Did you click **Save**?
2. Is the section eye turned on?
3. For a page: is status **Published**?
4. For a sale: is the sale price filled, and are the dates covering “now”?
5. Broke a page by accident? Try **History → Restore**
6. Still stuck? Message your developer with a screenshot + what you expected.

---

That’s it. You’re editing the real website — carefully, but confidently.
