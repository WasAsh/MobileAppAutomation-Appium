import { describe, it, beforeEach } from 'mocha'
import { expect } from '@wdio/globals'
import LoginPage from '../pageobjects/LoginPage.js'
import ProductsPage from '../pageobjects/ProductsPage.js'
import CartPage from '../pageobjects/CartPage.js'
import { standardUser } from '../data/users.js'

describe('Remove from cart @regression', () => {
    beforeEach(async () => {
        await browser.reloadSession()
    })

    it('login, add first product, remove it, verify cart is empty', async () => {
        await LoginPage.login(standardUser)
        expect(await ProductsPage.isProductsScreenDisplayed()).toBe(true)

        const productName = await ProductsPage.getFirstProductName()
        await ProductsPage.addFirstProductToCart()

        await CartPage.open()
        expect(await CartPage.isCartScreenDisplayed()).toBe(true)
        expect(await CartPage.isProductVisible(productName)).toBe(true)

        await CartPage.removeProduct()
        expect(await CartPage.isProductRemoved(productName)).toBe(true)
        expect(await CartPage.isCartEmpty()).toBe(true)
    })
})
