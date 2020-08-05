import React from 'react'
import TwitterIcon from '@material-ui/icons/Twitter'
import TelegramIcon from '@material-ui/icons/Telegram'
import YouTubeIcon from '@material-ui/icons/YouTube'
import EmailIcon from '@material-ui/icons/Email'
import LanguageIcon from '@material-ui/icons/Language'
import { makeStyles } from '@material-ui/core/styles'

import { ReactComponent as DiscordIcon } from '../../assets/images/icons/discord.svg'
import { ReactComponent as VrChatIcon } from '../../assets/images/icons/vrchat.svg'
import { ReactComponent as TwitchIcon } from '../../assets/images/icons/twitch.svg'
import { ReactComponent as GumroadIcon } from '../../assets/images/icons/gumroad.svg'
import { ReactComponent as PatreonIcon } from '../../assets/images/icons/patreon.svg'

import {
  getUrlForVrChatUserId,
  getUrlForTwitterUsername,
  getUrlForTelegramUsername,
  getUrlForYouTubeChannelByChannelId,
  getUrlForTwitchByUsername,
  getUrlForGumroadUsername,
  getUrlForPatreonByUsername
} from '../../social-media'
import { trackAction } from '../../analytics'

export const socialMediaType = {
  twitter: 'twitter',
  discord: 'discord',
  website: 'website',
  gumroad: 'gumroad'
}

const useStyles = makeStyles({
  item: {
    display: 'block',
    padding: '0.5rem'
  },
  notUrl: {
    cursor: 'default'
  },
  wrapper: {
    display: 'flex',
    alignItems: 'center'
  },
  iconWrapper: {
    width: '2rem',
    marginRight: '0.5rem',
    textAlign: 'right'
  },
  icon: {
    verticalAlign: 'middle',
    width: '1em',
    height: '1em'
  }
})

function SocialMediaListItem({
  actionCategory,
  item: { type, icon: Icon, url, label }
}) {
  const classes = useStyles()

  if (!label) {
    return null
  }

  const FinalIcon = () => (
    <div className={classes.wrapper}>
      <div className={classes.iconWrapper}>
        <Icon className={classes.icon} />
      </div>
      <div>{label}</div>
    </div>
  )

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={classes.item}
        onClick={() =>
          trackAction(actionCategory, `Click "${type}" social media button`)
        }>
        <FinalIcon />
      </a>
    )
  }

  return (
    <span className={`${classes.item} ${classes.notUrl}`}>
      <FinalIcon />
    </span>
  )
}

export default ({
  actionCategory,
  socialMedia: {
    websiteUrl,
    email,
    gumroadUsername,
    vrchatUsername,
    vrchatUserId,
    discordUsername,
    twitterUsername,
    telegramUsername,
    youtubeChannelId,
    twitchUsername,
    patreonUsername
  }
}) => {
  const items = [
    {
      icon: LanguageIcon,
      label: websiteUrl ? 'Visit Website' : undefined,
      url: websiteUrl,
      type: 'website'
    },
    {
      icon: EmailIcon,
      label: email ? 'Send Email' : undefined,
      url: `mailto:${email}`,
      type: 'email'
    },
    {
      icon: GumroadIcon,
      label: gumroadUsername ? 'Gumroad' : undefined,
      url: getUrlForGumroadUsername(gumroadUsername),
      type: 'gumroad'
    },
    {
      icon: VrChatIcon,
      label: vrchatUsername
        ? vrchatUsername
        : vrchatUserId
        ? 'VRChat Profile'
        : undefined,
      url: vrchatUserId ? getUrlForVrChatUserId(vrchatUserId) : undefined,
      type: 'vrchat'
    },
    {
      icon: DiscordIcon,
      label: discordUsername,
      type: 'discord'
    },
    {
      icon: TwitterIcon,
      label: twitterUsername ? `@${twitterUsername}` : undefined,
      url: getUrlForTwitterUsername(twitterUsername),
      type: 'twitter'
    },
    {
      icon: TelegramIcon,
      label: telegramUsername ? `@${telegramUsername}` : undefined,
      url: getUrlForTelegramUsername(telegramUsername),
      type: 'telegram'
    },
    {
      icon: YouTubeIcon,
      label: youtubeChannelId ? `YouTube Channel` : undefined,
      url: getUrlForYouTubeChannelByChannelId(youtubeChannelId),
      type: 'youtube'
    },
    {
      icon: TwitchIcon,
      label: twitchUsername,
      url: getUrlForTwitchByUsername(twitchUsername),
      type: 'twitch'
    },
    {
      icon: PatreonIcon,
      label: patreonUsername,
      url: getUrlForPatreonByUsername(patreonUsername),
      type: 'patreon'
    }
  ]
  return (
    <div>
      {items.map((item, idx) => (
        <SocialMediaListItem
          key={idx}
          item={item}
          actionCategory={actionCategory}
        />
      ))}
    </div>
  )
}
