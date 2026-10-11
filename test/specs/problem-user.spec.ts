import { describe, it, beforeEach } from 'mocha'
import { expect } from '@wdio/globals'
import LoginPage from '../pageobjects/LoginPage.js'
import ProductsPage from '../pageobjects/ProductsPage.js'
import CartPage from '../pageobjects/CartPage.js'
import { problemUser } from '../data/users.js'

// problem_user's documented quirk (broken product images) is visual-only:
// a live hierarchy dump of its PRODUCTS screen is semantically identical
// to standard_user's (same test-Item/title/price/button nodes), so broken
// images cannot be asserted from the accessibility tree. This test pins
// what IS observable: problem_user logs in and shops exactly like
// standard_user.
describe('Problem user @regression', () => {
    beforeEach(async () => {
        await browser.reloadSession()
    })

    it('logs in, adds first product, verifies it in cart', async () => {
        await LoginPage.login(problemUser)
        expect(await ProductsPage.isProductsScreenDisplayed()).toBe(true)

        const productName = await ProductsPage.getFirstProductName()
        await ProductsPage.addFirstProductToCart()

        await CartPage.open()
        expect(await CartPage.isCartScreenDisplayed()).toBe(true)
        expect(await CartPage.isProductVisible(productName)).toBe(true)
    })
})
