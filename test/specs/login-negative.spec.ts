import { describe, it, beforeEach } from 'mocha'
import { expect } from '@wdio/globals'
import LoginPage from '../pageobjects/LoginPage.js'
import { lockedOutUser, invalidUser, standardUser } from '../data/users.js'

describe('Login negative cases @regression', () => {
    beforeEach(async () => {
        await browser.reloadSession()
    })

    it('shows locked-out error for locked_out_user', async () => {
        await LoginPage.login(lockedOutUser)
        expect(await LoginPage.getErrorMessage()).toBe('Sorry, this user has been locked out.')
    })

    it('shows no-match error for invalid credentials', async () => {
        await LoginPage.login(invalidUser)
        expect(await LoginPage.getErrorMessage()).toBe(
            'Username and password do not match any user in this service.'
        )
    })

    it('shows required error for empty username', async () => {
        await LoginPage.login({ username: '', password: standardUser.password })
        expect(await LoginPage.getErrorMessage()).toBe('Username is required')
    })

    it('shows required error for empty password', async () => {
        await LoginPage.login({ username: standardUser.username, password: '' })
        expect(await LoginPage.getErrorMessage()).toBe('Password is required')
    })
})
