import React from 'react'
import Markdown from '../../components/markdown'

const aboutContent = `# About VRCArena

## Why did you make this site?

I created VRCArena because I wanted to quickly and easily find accessories for Pikapetey's Shiba Inu model.
I was scanning through his Discord and VRCMods and more to find accessories and animations but everyone I've
talked to agrees it's a huge pain in the ass. I wanted it all in one place!

So I applied my skills as a software engineer and built this site on 8 May 2020 according to the [first GitHub commit](https://github.com/imagitama/shiba-world/commit/a573ae2865bdb027488e76e09eda2c4eb936fc17).

## What are your plans for this site?

I work on it primarily on weekends to improve the experience and to increase the number of assets for you.
On weekdays I do small bug fixes and search for new assets.

Over time I want to rely on the community for the assets and I want to focus almost entirely on coding.

## How can I help?

As I am one person I am always interested in any help possible including:

- finding new assets and uploading them
- code changes via GitHub
- feedback and suggestions via my Discord or Twitter
- asking to be an "editor" who can approve and edit assets for quality

## Shout-outs

A big shout-out to [@Wolfee](https://twitter.com/WolfeeVRC) and [@Adivote](https://twitter.com/adivote) for helping me with the site including adding content, code changes and testing.

Another shout-out to the people I annoy on social media and Discord about the site - you are probably sick to death of me talking about it.

Finally to the community for such positive feedback. :)

Thanks for reading,

![My avatar](https://firebasestorage.googleapis.com/v0/b/shiba-world.appspot.com/o/avatars%2F04D3yeAUxTMWo8MxscQImHJwtLV2%2Fexport%20200.png?alt=media&token=9aa3d803-e91c-4711-b0bb-f4afc9ad52e6)

**Peanut**`

export default () => <Markdown source={aboutContent} />
