import BasePage from './BasePage.js'

class CartPage extends BasePage {
    private get cartButton() {
        return $('android=new UiSelector().description("test-Cart")')
    }

    private get title() {
        return $('android=new UiSelector().text("YOUR CART")')
    }

    async open(): Promise<void> {
        await this.tap(this.cartButton)
    }

    async isCartScreenDisplayed(): Promise<boolean> {
        await this.waitForDisplayed(this.title)
        return this.isDisplayed(this.title)
    }

    async isProductVisible(productName: string): Promise<boolean> {
        const item = $(`android=new UiSelector().text("${productName}")`)
        await this.waitForDisplayed(item)
        return this.isDisplayed(item)
    }
}

export default new CartPage()
