type UIElement = ReturnType<typeof $>

export default class BasePage {
    protected async waitForDisplayed(element: UIElement, timeout = 10000): Promise<void> {
        await element.waitForDisplayed({ timeout })
    }

    protected async tap(element: UIElement): Promise<void> {
        await this.waitForDisplayed(element)
        await element.click()
    }

    protected async type(element: UIElement, text: string): Promise<void> {
        await this.waitForDisplayed(element)
        await element.setValue(text)
    }

    async isDisplayed(element: UIElement): Promise<boolean> {
        return element.isDisplayed()
    }
}
