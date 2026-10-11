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

    // Scrolls the first scrollable container until an element matching the
    // given UiSelector fragment (e.g. 'new UiSelector().description("test-X")')
    // is visible, and returns it. Prefer plain selectors; use this only for
    // elements below the fold on small screens.
    protected scrollToElement(innerSelector: string): UIElement {
        return $(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(${innerSelector})`)
    }
}
