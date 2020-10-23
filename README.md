# VS Edu

Jetbrains made a great educational platform out of IntelliJ IDEA, but unfortunately, it only covers Java, Kotlin, and Python,
so I'm making a Visual Studio variant. This extension is very early in development and currently only supports 
Javascript with Jest.

## Motivation

My motivation for making this stems from a couple places. All of them at my summer camp.

Foremost, VS Code has had an undeniable surge in popularity, with Microsoft taking it from some random code editor to the single most popular IDE in the
entire industry in around a year. It should be noted, it is not without merit. I use Jetbrains products, as does everyone else at my camp. They make great products,
and their support for Java is unmatched still. However, with plugins, VS Code comes _darn close_ in other languages like Javascript, especially since Microsoft develops
TypeScript. As a result, it's compelling to teach campers to code using VS Code since it's what most people use, and it's free. However, as mentioned previously, there is no
extension that is close to Jetbrain's edu platform.

Secondly, I want to challenge myself to make a better personal curriculum. One of the main tenants of our camp is the ability of our counselors to personalize curriculum to
individual campers, and that will always be true. However, most campers happen to fall into some main categories and get taught the same things. Therefore, it is useful to
have a set of lessons and challenges to at least start from. They can always be personalized and changed, but starting from scratch every summer is a little exhausting.

## Building

To build yourself, you must have a Font Awesome Pro license. To generate
all of the icon files, run the `generate-icons` npm task.

After you do that, you can open the extension in VS Code and press F5 to
debug as normal.
