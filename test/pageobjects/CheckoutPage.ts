import BasePage from './BasePage.js'
import type { CheckoutInformation } from '../data/users.js'

class CheckoutPage extends BasePage {
    private get infoTitle() {
        return $('android=new UiSelector().text("CHECKOUT: INFORMATION")')
    }

    private get firstNameField() {
        return $('~test-First Name')
    }

    private get lastNameField() {
        return $('~test-Last Name')
    }

    private get postalCodeField() {
        return $('~test-Zip/Postal Code')
    }

    private get continueButton() {
        return $('~test-CONTINUE')
    }

    private get overviewTitle() {
        return $('android=new UiSelector().text("CHECKOUT: OVERVIEW")')
    }

    private get finishButton() {
        // FINISH sits at the bottom of the long overview screen, below the
        // fold on phone-sized emulators.
        return this.scrollToElement('new UiSelector().description("test-FINISH")')
    }

    private get completeTitle() {
        return $('android=new UiSelector().text("CHECKOUT: COMPLETE!")')
    }

    private get thankYouMessage() {
        return $('android=new UiSelector().text("THANK YOU FOR YOU ORDER")')
    }

    async fillInformation(info: CheckoutInformation): Promise<void> {
        await this.waitForDisplayed(this.infoTitle)
        await this.type(this.firstNameField, info.firstName)
        await this.type(this.lastNameField, info.lastName)
        await this.type(this.postalCodeField, info.postalCode)
        await this.tap(this.continueButton)
    }

    async finish(): Promise<void> {
        await this.waitForDisplayed(this.overviewTitle)
        await this.tap(this.finishButton)
    }

    async isCheckoutCompleteDisplayed(): Promise<boolean> {
        await this.waitForDisplayed(this.completeTitle)
        return this.isDisplayed(this.thankYouMessage)
    }
}

export default new CheckoutPage()
