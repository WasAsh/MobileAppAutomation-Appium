import BasePage from './BasePage.js'

class CartPage extends BasePage {
    private get cartButton() {
        return $('android=new UiSelector().description("test-Cart")')
    }

    private get title() {
        return $('android=new UiSelector().text("YOUR CART")')
    }

    private get checkoutButton() {
        return $('~test-CHECKOUT')
    }

    private get removeButton() {
        return $('~test-REMOVE')
    }

    async open(): Promise<void> {
        await this.tap(this.cartButton)
    }

    async isCartScreenDisplayed(): Promise<boolean> {
        await this.waitForDisplayed(this.title)
        return this.isDisplayed(this.title)
    }

    async proceedToCheckout(): Promise<void> {
        await this.tap(this.checkoutButton)
    }

    async isProductVisible(productName: string): Promise<boolean> {
        const item = $(`android=new UiSelector().text("${productName}")`)
        await this.waitForDisplayed(item)
        return this.isDisplayed(item)
    }

    // Single-item cart (fresh session + one add): the only REMOVE button
    // belongs to the added product.
    async removeProduct(): Promise<void> {
        await this.tap(this.removeButton)
    }

    async isProductRemoved(productName: string): Promise<boolean> {
        const item = $(`android=new UiSelector().text("${productName}")`)
        return item.waitForExist({ timeout: 10000, reverse: true })
    }

    async isCartEmpty(): Promise<boolean> {
        return this.removeButton.waitForExist({ timeout: 10000, reverse: true })
    }
}

export default new CartPage()
