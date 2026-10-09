import { describe, it } from 'mocha'
import { expect } from '@wdio/globals'
import LoginPage from '../pageobjects/LoginPage.js'
import ProductsPage from '../pageobjects/ProductsPage.js'
import CartPage from '../pageobjects/CartPage.js'
import { standardUser } from '../data/users.js'

describe('Add to cart E2E @regression', () => {
    it('login as standard user, add first product, verify it in cart', async () => {
        await LoginPage.login(standardUser)
        expect(await ProductsPage.isProductsScreenDisplayed()).toBe(true)

        const productName = await ProductsPage.getFirstProductName()
        await ProductsPage.addFirstProductToCart()

        await CartPage.open()
        expect(await CartPage.isCartScreenDisplayed()).toBe(true)
        expect(await CartPage.isProductVisible(productName)).toBe(true)
    })
})
