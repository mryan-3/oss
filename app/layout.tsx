import './global.css'
import { Metadata } from 'next'
import type { ReactNode } from 'react'
import { DM_Sans } from 'next/font/google'
import { RootProvider } from 'fumadocs-ui/provider'

const dmSans = DM_Sans({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-dm-sans',
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
})

export const metadata: Metadata = {
    title: 'Zenetra Labs | Your Partner in All Matters Software',
    description:
        'Zenetra Labs is a software development company. We specialize in different fields of software development. We develop a wide range of software tools for different industries. We are your partner in all matters software.',
    metadataBase: new URL('https://zenetralabs.com'),
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: '/',
        images: '/opengraph-image.png'
    },
    robots: {
        index: true,
        follow: true,
        nocache: true,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1
        }
    },
    keywords: [
        'software',
        'software development',
        'software tools',
        'software design',
        'zenetra labs',
        'zenetra',
        'zenetralabs',
        'kenya software development',
        'africa software development',
        'software development company',
        'best software development company in Kenya'
    ],
    category: 'software'
}

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <html lang='en' className={dmSans.className} suppressHydrationWarning>
            <body className='flex flex-col min-h-screen'>
                <RootProvider>{children}</RootProvider>
            </body>
        </html>
    )
}
