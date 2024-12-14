import { themes as prismThemes } from 'prism-react-renderer'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'
import tailwindPlugin from './plugins/tailwind-plugin.cjs'

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
    title: 'Zenetra OSS',
    tagline: 'Open Source Software by Zenetra',
    favicon: 'img/favicon.ico',

    // Set the production url of your site here
    url: 'https://oss.zenetra.com',
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/',

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'zenetralabs', // Usually your GitHub org/user name.
    projectName: 'oss', // Usually your repo name.

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'en',
        locales: ['en']
    },

    // Plugins
    plugins: [
        tailwindPlugin,
        [
            '@docusaurus/plugin-ideal-image',
            {
                quality: 70,
                max: 1030, // max resized image's size.
                min: 640, // min resized image's size. if original is lower, use that size.
                steps: 2, // the max number of images generated between min and max (inclusive)
                disableInDev: false
            }
        ]
    ],

    presets: [
        [
            'classic',
            {
                docs: {
                    sidebarPath: './sidebars.ts',
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl: 'https://github.com/zenetralabs/oss'
                },
                blog: {
                    showReadingTime: true,
                    feedOptions: {
                        type: ['rss', 'atom'],
                        xslt: true
                    },
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl: 'https://github.com/zenetralabs/oss',
                    // Useful options to enforce blogging best practices
                    onInlineTags: 'warn',
                    onInlineAuthors: 'warn',
                    onUntruncatedBlogPosts: 'warn'
                },
                theme: {
                    customCss: './src/css/custom.css'
                }
            } satisfies Preset.Options
        ]
    ],

    themeConfig: {
        // Replace with your project's social card
        image: 'img/docusaurus-social-card.jpg',
        navbar: {
            title: 'Zenetra OSS',
            logo: {
                href: 'https://zenetra.com',
                alt: 'Zenetra Logo',
                src: 'img/zenetra_logo.png'
            },
            items: [
                {
                    position: 'left',
                    label: 'Projects',
                    to: '#projects'
                },
                { to: '/blog', label: 'Blog', position: 'left' },
                {
                    href: 'https://github.com/zenetralabs/oss',
                    label: 'GitHub',
                    position: 'right'
                }
            ]
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: 'Docs',
                    items: [
                        {
                            label: 'Mpesa SDK',
                            to: '/docs/mpesa'
                        }
                    ]
                },
                {
                    title: 'Community',
                    items: [
                        {
                            label: 'LinkedIn',
                            href: 'https://www.linkedin.com/company/zenetra'
                        },
                        {
                            label: 'Instagram',
                            href: 'https://instagram.com/zenetralabs'
                        },
                        {
                            label: 'X',
                            href: 'https://x.com/zenetralabs'
                        }
                    ]
                },
                {
                    title: 'More',
                    items: [
                        {
                            label: 'Blog',
                            to: '/blog'
                        },
                        {
                            label: 'GitHub',
                            href: 'https://github.com/zenetralabs'
                        }
                    ]
                }
            ],
            copyright: `Copyright © ${new Date().getFullYear()} Zenetra Labs`
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula
        }
    } satisfies Preset.ThemeConfig
}

export default config
