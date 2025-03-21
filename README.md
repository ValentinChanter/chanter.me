<p align="center">
  <a href="https://chanter.me">
    <img src="https://i.imgur.com/JGeJ7EL.png" height="128">
    <h3 align="center">chanter.me</h3>
  </a>
</p>

<p align="center">My own personal website</p>

<br/>

## Introduction

This is a website where I throw mostly random stuff I think of on my free time. The website is made with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/).

## Installation

If somehow you want to run this website on your own, here's how to do so:

1. Clone this repo and access it

	```bash
	git clone https://github.com/ValentinChanter/chanter.me
	cd chanter.me
	```

2. Install node dependencies

	```bash
    npm install
    # or
	pnpm install
	```

3. Run the development server

	```bash
	npm run dev
    # or
	pnpm dev
	```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the app

## Features

The index is empty but some endpoints are manually reachable. They respectively contain:
- a CTF-like challenge ~~with a leaderboard~~
- a french Wikipedia race (or Wikirace) random bingo generator that features:
  - a 5x5 grid made with words retrieved from a local file, downloaded from the [20250317 Wikipedia dump of all titles in namespace 0](https://dumps.wikimedia.org/other/pagetitles/20250317/frwiki-20250317-all-titles-in-ns-0.gz).
  - a random starting word picked the same way
  - banning specific words matching RegEx found in [config/bingo.ts](https://github.com/ValentinChanter/chanter.me/blob/main/config/bingo.ts)
  - checking/unchecking a cell with the player's color
  - ~~choosing that color~~
  - create/join rooms