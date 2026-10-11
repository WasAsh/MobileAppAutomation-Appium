import { describe, it, beforeEach } from 'mocha'
import { expect } from '@wdio/globals'
import LoginPage from '../pageobjects/LoginPage.js'
import ProductsPage from '../pageobjects/ProductsPage.js'
import CartPage from '../pageobjects/CartPage.js'
import CheckoutPage from '../pageobjects/CheckoutPage.js'
import { standardUser, checkoutInfo } from '../data/users.js'

describe('Checkout E2E @regression', () => {
    beforeEach(async () => {
        await browser.reloadSession()
    })

    it('login, add first product, checkout, finish, verify order complete', async () => {
        await LoginPage.login(standardUser)
        expect(await ProductsPage.isProductsScreenDisplayed()).toBe(true)

        await ProductsPage.addFirstProductToCart()

        await CartPage.open()
        expect(await CartPage.isCartScreenDisplayed()).toBe(true)

        await CartPage.proceedToCheckout()
        await CheckoutPage.fillInformation(checkoutInfo)
        await CheckoutPage.finish()
        expect(await CheckoutPage.isCheckoutCompleteDisplayed()).toBe(true)
    })
})
