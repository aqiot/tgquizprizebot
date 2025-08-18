# Telegram Quiz Prize Bot

A Telegram bot for managing quiz campaigns and generating campaign links.

## Features

- `/createcampaign` - Create a campaign link with a custom campaign ID
- `/campaigns` - List all existing campaigns from the database
- `/help` - Display help information
- `/start` - Welcome message and command overview

## Setup

### 1. Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` and follow the instructions
3. Save the bot token provided by BotFather

### 2. Configure Environment

```bash
cp .env.example .env
