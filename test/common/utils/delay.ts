export async function delay(timeInMs: number = 1000) {
    await new Promise((resolve) => setTimeout(resolve, timeInMs))
}
