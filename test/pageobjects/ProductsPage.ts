import BasePage from './BasePage.js'

class ProductsPage extends BasePage {
    private get title() {
        return $('android=new UiSelector().text("PRODUCTS")')
    }

    private get firstProductItem() {
        return $('android=new UiSelector().description("test-Item").instance(0)')
    }

    async isProductsScreenDisplayed(): Promise<boolean> {
        await this.waitForDisplayed(this.title)
        return this.isDisplayed(this.title)
    }

    async addFirstProductToCart(): Promise<void> {
        const button = this.firstProductItem.$(
            'android=new UiSelector().description("test-ADD TO CART")'
        )
        await this.tap(button)
    }

    async getFirstProductName(): Promise<string> {
        const name = this.firstProductItem.$(
            'android=new UiSelector().description("test-Item title")'
        )
        await this.waitForDisplayed(name)
        return name.getText()
    }
}

export default new ProductsPage()
