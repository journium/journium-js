import React, { ReactNode } from 'react';
import { JourniumConfig } from '@journium/shared';
import { GetServerSidePropsContext, GetStaticPropsContext } from 'next';
export * from '@journium/react';

interface NextJourniumProviderProps {
    children: ReactNode;
    config: JourniumConfig;
    autoCapture?: boolean;
    trackRouteChanges?: boolean;
}
declare const NextJourniumProvider: React.FC<NextJourniumProviderProps>;

declare const isServerSide: () => boolean;
declare const getPagePropsForSSR: (context: GetServerSidePropsContext | GetStaticPropsContext) => {
    $current_url: string;
    $host: string | undefined;
    $pathname: string;
    $search: string | undefined;
    $referrer: string;
} | {
    $current_url?: never;
    $host?: never;
    $pathname?: never;
    $search?: never;
    $referrer?: never;
};

export { NextJourniumProvider, getPagePropsForSSR, isServerSide };
