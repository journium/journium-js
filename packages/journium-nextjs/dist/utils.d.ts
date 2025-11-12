import { GetServerSidePropsContext, GetStaticPropsContext } from 'next';
export declare const isServerSide: () => boolean;
export declare const getPagePropsForSSR: (context: GetServerSidePropsContext | GetStaticPropsContext) => {
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
//# sourceMappingURL=utils.d.ts.map