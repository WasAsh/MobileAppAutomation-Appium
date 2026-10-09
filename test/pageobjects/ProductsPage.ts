import BasePage from './BasePage.js'

class ProductsPage extends BasePage {
    private get title() {
        return $('android=new UiSelector().text("PRODUCTS")')
    }

    async isProductsScreenDisplayed(): Promise<boolean> {
        await this.waitForDisplayed(this.title)
        return this.isDisplayed(this.title)
    }

    async addFirstProductToCart(): Promise<void> {
        await this.tap($('android=new UiSelector().text("ADD TO CART").instance(0)'))
    }

    async getFirstProductName(): Promise<string> {
        const name = await $('android=new UiSelector().text("Sauce Labs Backpack")').getText()
        return name
    }
}

export default new ProductsPage()
