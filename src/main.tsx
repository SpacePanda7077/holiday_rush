import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { createAppKit, AppKitButton } from "@reown/appkit/react";
import { WagmiProvider } from "wagmi";
import { SomniaMainnet } from "./network/network.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId from https://dashboard.reown.com
const projectId = "f4bd2e334ff5d3baaa5c041fccc89dd1";

// 3. Set the networks
const networks = [SomniaMainnet];

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
    networks,
    projectId,
    ssr: true,
});

createAppKit({
    adapters: [wagmiAdapter],
    networks: [SomniaMainnet],
    projectId,
});

interface AppkitProp {
    children: any;
}

export function AppKitProvider({ children }: AppkitProp) {
    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}

export default function ConnectButton() {
    return <AppKitButton />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <AppKitProvider>
            <div style={{ position: "absolute" }}>
                <ConnectButton />
            </div>
            <App />
        </AppKitProvider>
    </React.StrictMode>
);
