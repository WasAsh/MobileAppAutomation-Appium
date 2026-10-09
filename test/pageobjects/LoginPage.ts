import BasePage from './BasePage.js'
import type { UserCredentials } from '../data/users.js'

class LoginPage extends BasePage {
    private get usernameField() {
        return $('~test-Username')
    }

    private get passwordField() {
        return $('~test-Password')
    }

    private get loginButton() {
        return $('android=new UiSelector().text("LOGIN")')
    }

    private get errorMessage() {
        return $('//*[@content-desc="test-Error message"]/android.widget.TextView')
    }

    async isLoginScreenDisplayed(): Promise<boolean> {
        await this.waitForDisplayed(this.loginButton)
        return this.isDisplayed(this.loginButton)
    }

    async login(user: UserCredentials): Promise<void> {
        await this.type(this.usernameField, user.username)
        await this.type(this.passwordField, user.password)
        await this.tap(this.loginButton)
    }

    async getErrorMessage(): Promise<string> {
        await this.waitForDisplayed(this.errorMessage)
        return this.errorMessage.getText()
    }
}

export default new LoginPage()
