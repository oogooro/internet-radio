declare global {
    namespace NodeJS {
        interface ProcessEnv {
            ENV: 'dev' | 'prod';
            PORT: string;
        }
    }
}

export { };