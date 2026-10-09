import { describe, it } from 'mocha'
import { expect } from '@wdio/globals'
import LoginPage from '../pageobjects/LoginPage.js'

describe('Swag Labs Mobile App @smoke', () => {
    it('should launch the application', async () => {
        expect(await LoginPage.isLoginScreenDisplayed()).toBe(true)
    })
})