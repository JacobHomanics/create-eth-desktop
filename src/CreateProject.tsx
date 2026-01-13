import React, { useEffect, useMemo, useState } from "react";

interface CreateProjectProps {
  onBack: () => void;
  onProjectCreated?: () => void;
}

export default function CreateProject({ onBack, onProjectCreated }: CreateProjectProps) {
  const [cwd, setCwd] = useState<string>("");
  const [projectName, setProjectName] = useState("my-eth-app");
  const [framework, setFramework] = useState<"hardhat" | "foundry">("foundry");
  const [version, setVersion] = useState<string>(() => {
    return localStorage.getItem('createEthVersion') || 'latest';
  });
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Record<string, string>>({});
  const [loadingVersions, setLoadingVersions] = useState(true);
  const [extension, setExtension] = useState<string | null>(null);
  const [logs, setLogs] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [terminalExpanded, setTerminalExpanded] = useState(false);
  const [terminalVisible, setTerminalVisible] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [extensionsExpanded, setExtensionsExpanded] = useState(false);
  
  const canRun = useMemo(
    () => !!cwd && !!projectName && !running && !validationError && !isValidating,
    [cwd, projectName, running, validationError, isValidating]
  );

  const supportedExtensions = [
    { 
      id: "subgraph", 
      name: "Subgraph", 
      description: "Adds support for building, testing, and deploying subgraphs locally, with seamless front-end integration and easy deployment to Subgraph Studio.",
      github: "https://github.com/scaffold-eth/create-eth-extensions/tree/subgraph"
    },
    { 
      id: "x402", 
      name: "x402", 
      description: "Adds support for monetizing APIs and pages with x402 protocol micropayments.",
      github: "https://github.com/scaffold-eth/create-eth-extensions/tree/x402"
    },
    { 
      id: "eip-712", 
      name: "EIP-712", 
      description: "Provides EIP-712 typed message signing, sending, and verification in a user-friendly way.",
      github: "https://github.com/scaffold-eth/create-eth-extensions/tree/eip-712"
    },
    { 
      id: "ponder", 
      name: "Ponder", 
      description: "Provides a pre-configured setup for ponder.sh, helping you get started quickly with event indexing.",
      github: "https://github.com/scaffold-eth/create-eth-extensions/tree/ponder"
    },
    { 
      id: "erc-20", 
      name: "ERC-20", 
      description: "Adds support for ERC-20 token contracts, including balance checks and token transfers.",
      github: "https://github.com/scaffold-eth/create-eth-extensions/tree/erc-20"
    },
    { 
      id: "eip-5792", 
      name: "EIP-5792", 
      description: "Provides EIP-5792 wallet capabilities, allowing multiple calls and status checks via new JSON-RPC methods.",
      github: "https://github.com/scaffold-eth/create-eth-extensions/tree/eip-5792"
    },
    { 
      id: "randao", 
      name: "RANDAO", 
      description: "Provides on-chain randomness using RANDAO for unpredictable random sources.",
      github: "https://github.com/scaffold-eth/create-eth-extensions/tree/randao"
    },
    { 
      id: "erc-721", 
      name: "ERC-721", 
      description: "Adds support for ERC-721 NFT contracts, including supply, balance, listing, and transfer features.",
      github: "https://github.com/scaffold-eth/create-eth-extensions/tree/erc-721"
    },
    { 
      id: "porto", 
      name: "Porto", 
      description: "This extension brings porto.sh SDK to Scaffold-ETH 2.",
      github: "https://github.com/scaffold-eth/create-eth-extensions/tree/porto"
    },
    { 
      id: "envio", 
      name: "Envio", 
      description: "This extension integrates Envio Indexer, it makes indexing your deployed smart contracts as simple as possible.",
      github: "https://github.com/scaffold-eth/create-eth-extensions/tree/envio"
    },
    { 
      id: "drizzle-neon", 
      name: "Drizzle Neon", 
      description: "This extension sets up a local database with Drizzle ORM. Optimized to work using Neon as the database provider.",
      github: "https://github.com/scaffold-eth/create-eth-extensions/tree/drizzle-neon"
    },
    { 
      id: "metamask/erc-7715-extension", 
      name: "MetaMask Advanced Permissions", 
      description: "This extension helps you get started with MetaMask Advanced Permissions (ERC-7715).",
      github: "https://github.com/MetaMask/erc-7715-extension"
    },
    { 
      id: "metamask/gator-extension", 
      name: "Smart Accounts Kit", 
      description: "This extension helps you get started with MetaMask Smart Accounts, and ERC-7710 delegations.",
      github: "https://github.com/MetaMask/gator-extension"
    },
    { 
      id: "signinwithethereum/scaffold-siwe-ext", 
      name: "SIWE", 
      description: "This extension helps you get started with SIWE (Sign-In with Ethereum). Authenticate using your Ethereum wallet. No passwords needed.",
      github: "https://github.com/signinwithethereum/scaffold-siwe-ext"
    },
    { 
      id: "ethereumidentitykit/scaffold-efp-ext", 
      name: "EFP", 
      description: "This extension adds Ethereum Follow Protocol (EFP) social graph functionality to your Scaffold-ETH 2 project. EFP is the onchain social graph protocol for Ethereum accounts - like Twitter follows, but fully decentralized and portable across any dApp.",
      github: "https://github.com/ethereumidentitykit/scaffold-efp-ext"
    },
  ];

  const unsupportedExtensions = [
    { 
      id: "scobru/pocketbase-extension", 
      name: "Pocketbase", 
      description: "This extension allows you to easily implement Pocketbase in your dapp with some useful functions.",
      github: "https://github.com/scobru/pocketbase-extension"
    },
    { 
      id: "RafaelCaso/currency-conversion-extension", 
      name: "Currency Conversion", 
      description: "Using ExchangeRateAPI gain access to conversion rates and integrate them into Scaffold-ETH2's UI. See current price of ETH in any global currency while leveraging SE2's EtherInput component to easily convert between the two.",
      github: "https://github.com/RafaelCaso/currency-conversion-extension"
    },
    { 
      id: "Kredeum/onchain-ai-extension", 
      name: "OnChainAI", 
      description: "Scaffold-ETH extension to call Onchain OpenAI with Chainlink Functions.",
      github: "https://github.com/Kredeum/onchain-ai-extension"
    },
    { 
      id: "d4rm5/eip712-builder", 
      name: "EIP-712 Builder", 
      description: "Scaffold ETH 2 extension to build and test EIP-712 signatures easily.",
      github: "https://github.com/d4rm5/eip712-builder"
    },
    { 
      id: "Okhayeeli/quadratic-voting-extension", 
      name: "Quadratic Voting", 
      description: "This project implements a quadratic voting system with Ethereum Attestation Service (EAS) integration for vote attestation.",
      github: "https://github.com/Okhayeeli/quadratic-voting-extension"
    },
    { 
      id: "tantodefi/capsule-extension", 
      name: "Capsule", 
      description: "This Scaffold-ETH 2 extension comes pre-configured with Capsule for email and SMS login with MPC, providing an example to help you get started quickly.",
      github: "https://github.com/tantodefi/capsule-extension"
    },
    { 
      id: "Chuksremi15/se2-ens-library-v3", 
      name: "ENS in-app", 
      description: "This is a build that makes ens registration possible in-app, As you know already for users to register an ENS name, update profile image or primary address.",
      github: "https://github.com/Chuksremi15/se2-ens-library-v3"
    },
    { 
      id: "vick2592/squid-widget-extension", 
      name: "Squid Widget", 
      description: "Squid Router Widget Implementation for Scaffold ETH.",
      github: "https://github.com/vick2592/squid-widget-extension"
    },
    { 
      id: "arjanjohan/scaffold-chainlink-extension", 
      name: "Chainlink", 
      description: "This SE2 extension is meant as a beginners guide to working with Chainlink. This extensions comes with example smart contracts and frontend components, which can serve as the basis for your Chainlink based dApp or project.",
      github: "https://github.com/arjanjohan/scaffold-chainlink-extension"
    },
    { 
      id: "bhavyagor12/randomness-extension", 
      name: "Randomness", 
      description: "This Scaffold-ETH 2 extension comes pre-configured with a Randomness Generator contract and a frontend to interact with it.",
      github: "https://github.com/bhavyagor12/randomness-extension"
    },
    { 
      id: "tantodefi/flexy-extension", 
      name: "Flexy", 
      description: "This Scaffold-ETH 2 extension comes pre-configured with flexy.tech, providing an example to help you get started quickly. The Flexy widget opens a cross-chain bridge swap UI so users can get gas on the chain they need for your dapp.",
      github: "https://github.com/tantodefi/flexy-extension"
    },
    { 
      id: "Paul-Sizon/rootstock-extention", 
      name: "Rootstock", 
      description: "This extension is designed to support development on the Rootstock sidechain, a Bitcoin-powered smart contract platform.",
      github: "https://github.com/Paul-Sizon/rootstock-extention"
    },
    { 
      id: "zapaz/fleek-extension", 
      name: "Fleek", 
      description: "fleek-extension is a Scaffold-eth-2 extension, allowing you to deploy your Dapps on Fleek decentralized storage",
      github: "https://github.com/zapaz/fleek-extension"
    },
    { 
      id: "bhavyagor12/privy-widget", 
      name: "Privy Widget", 
      description: "With privy its super simple to onboard all users to web3. This extension preconfigured with creating new wallet for users that onboard using email helps developers.",
      github: "https://github.com/bhavyagor12/privy-widget"
    },
    { 
      id: "FilipHarald/MagicAddressInput", 
      name: "Magic Address Input", 
      description: "Extension for scaffold-eth-2 to add suggestions to address input bar.",
      github: "https://github.com/FilipHarald/MagicAddressInput"
    },
    { 
      id: "nzmpi/ZkTree-extension-se2", 
      name: "ZkTree", 
      description: "This extension implements a zero knowledge Merkle tree. I made it as general as possible to make it easy to use in different projects.",
      github: "https://github.com/nzmpi/ZkTree-extension-se2"
    },
    { 
      id: "tantodefi/dynamic-extension", 
      name: "Dynamic", 
      description: "This Scaffold-ETH 2 extension comes pre-configured with Dynamic.xyz, providing an example to help you get started quickly. Quickly use social login, email login and sign in with farcaster with scaffold-eth2!",
      github: "https://github.com/tantodefi/dynamic-extension"
    },
    { 
      id: "iPaulPro/scaffold-lens:ext", 
      name: "Lens", 
      description: "A Scaffold-ETH 2 extension for building, debugging, testing, and deploying Open Actions and Collect Modules on Lens Protocol using Hardhat.",
      github: "https://github.com/iPaulPro/scaffold-lens"
    },
    { 
      id: "ValentineCodes/universal-profile-extension", 
      name: "Universal Profile", 
      description: "This Scaffold-ETH extension introduces hooks and components to facilitate the integration of Lukso's Universal Profiles",
      github: "https://github.com/ValentineCodes/universal-profile-extension"
    },
  ];

  useEffect(() => {
    // Initialize cwd from last selected directory
    const lastPath = localStorage.getItem('lastSelectedDirectory');
    if (lastPath) {
      setCwd(lastPath);
    }

    // Check if API is available
    if (!window.api) {
      console.error("Window API not available");
    } else if (!window.api.validateProjectName) {
      console.warn("validateProjectName API not available - please restart Electron app");
    }

    const offLog = window.api.onLog((line) => setLogs((prev) => prev + line));
    const offExit = window.api.onExit((code) => setExitCode(code));

    // Fetch available versions
    if (window.api.getCreateEthVersions) {
      window.api.getCreateEthVersions()
        .then(({ versions, tags }) => {
          setAvailableVersions(versions);
          setAvailableTags(tags);
          setLoadingVersions(false);
        })
        .catch((err) => {
          console.error("Failed to fetch versions:", err);
          setLoadingVersions(false);
        });
    } else {
      setLoadingVersions(false);
    }

    return () => {
      offLog();
      offExit();
    };
  }, []);

  // Validate project name when cwd or projectName changes
  useEffect(() => {
    if (!cwd || !projectName) {
      setValidationError(null);
      return;
    }

    setIsValidating(true);
    const timeoutId = setTimeout(async () => {
      try {
        if (!window.api) {
          setIsValidating(false);
          return;
        }
        if (!window.api.validateProjectName) {
          // API not available - silently skip validation
          setIsValidating(false);
          setValidationError(null);
          return;
        }
        const result = await window.api.validateProjectName(cwd, projectName);
        if (result && typeof result === 'object' && 'valid' in result) {
          setValidationError(result.valid ? null : result.error);
        } else {
          console.error("Invalid validation result:", result);
          setValidationError(null);
        }
      } catch (error) {
        console.error("Validation error:", error);
        setValidationError(null); // Don't show error on validation failure, just log it
      } finally {
        setIsValidating(false);
      }
    }, 300); // Debounce validation by 300ms

    return () => {
      clearTimeout(timeoutId);
      setIsValidating(false);
    };
  }, [cwd, projectName]);

  async function pickDir() {
    const lastPath = localStorage.getItem('lastSelectedDirectory') || undefined;
    const picked = await window.api.pickDirectory(lastPath);
    if (picked) {
      setCwd(picked);
      localStorage.setItem('lastSelectedDirectory', picked);
    }
  }

  async function run() {
    setLogs("");
    setExitCode(null);
    setTerminalExpanded(false);
    setTerminalVisible(false);
    setRunning(true);
    try {
      await window.api.runCreateEth(cwd, projectName, {
        framework: framework,
        extensions: extension ? [extension] : undefined,
        version: version,
      });
      // Project created successfully, open it in the preferred IDE
      const selectedIDE = (localStorage.getItem("selectedIDE") || "cursor") as "cursor" | "vscode";
      // Construct project path - normalize separators (Electron will handle platform-specific paths)
      const separator = cwd.includes("\\") ? "\\" : "/";
      const projectPath = cwd.endsWith("/") || cwd.endsWith("\\") 
        ? `${cwd}${projectName}` 
        : `${cwd}${separator}${projectName}`;
      
      try {
        const result = await window.api.openInIDE(projectPath, selectedIDE);
        if (!result.ok) {
          console.warn("Failed to open project in IDE:", result.error);
        }
      } catch (ideError) {
        // Don't fail the whole operation if IDE opening fails
        console.error("Failed to open project in IDE:", ideError);
      }
      
      // Go back to projects list
      if (onProjectCreated) {
        onProjectCreated();
      }
    } catch (e: any) {
      setLogs((prev) => prev + `\n[ERROR] ${e?.message ?? String(e)}\n`);
    } finally {
      setRunning(false);
    }
  }

  function selectExtension(ext: string | null) {
    setExtension(ext === extension ? null : ext);
    if (ext && ext !== extension) {
      // Collapse the extensions list when an extension is selected
      setExtensionsExpanded(false);
    }
  }

  function getDisplayLogs(): string {
    if (!logs) return "Output will appear here…";
    if (terminalExpanded) return logs;
    
    // Show last 20 lines when collapsed
    const lines = logs.split('\n');
    if (lines.length <= 20) return logs;
    return '...\n' + lines.slice(-20).join('\n');
  }

  function getLatestLine(): string {
    if (!logs) return "Output will appear here…";
    const lines = logs.split('\n').filter(line => line.trim().length > 0);
    return lines.length > 0 ? lines[lines.length - 1] : "Output will appear here…";
  }

  return (
    <div className="wrap">
      <header className="header">
        <div className="header-top">
          <button onClick={onBack} className="back-button" disabled={running}>
            ← Back
          </button>
          <h1>Create New Project</h1>
        </div>
      </header>

      <section className="controls">
        <div className="row">
          <button onClick={pickDir} disabled={running}>
            Choose Folder…
          </button>
          <div className="path">{cwd ? cwd : "No folder selected"}</div>
        </div>

        <div className="row">
          <label>Project name</label>
          <input
            value={projectName}
            disabled={running}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="my-eth-app"
            style={{
              borderColor: validationError ? '#ff6b6b' : undefined
            }}
          />
        </div>
        {validationError && (
          <div className="row small" style={{ 
            color: '#ff6b6b', 
            marginTop: '-8px',
            marginLeft: '120px'
          }}>
            {validationError}
          </div>
        )}

        <div className="row">
          <label>Framework</label>
          <select
            value={framework}
            disabled={running}
            onChange={(e) => setFramework(e.target.value as "hardhat" | "foundry")}
            className="select"
          >
            <option value="hardhat">Hardhat</option>
            <option value="foundry">Foundry</option>
          </select>
        </div>

        <div className="row">
          <label>Version</label>
          {loadingVersions ? (
            <select disabled className="select" style={{ opacity: 0.6 }}>
              <option>Loading versions...</option>
            </select>
          ) : (
            <select
              value={version}
              disabled={running}
              onChange={(e) => {
                const newVersion = e.target.value;
                setVersion(newVersion);
                localStorage.setItem('createEthVersion', newVersion);
              }}
              className="select"
            >
              {/* Show dist-tags first */}
              {Object.entries(availableTags).map(([tagName, tagVersion]) => (
                <option key={tagName} value={tagName}>
                  {tagName} ({tagVersion})
                </option>
              ))}
              {/* Show all versions, but limit to recent ones for performance */}
              {availableVersions.slice(0, 50).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="row" style={{ alignItems: 'flex-start' }}>
          <label style={{ paddingTop: '4px' }}>Extensions</label>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {extension && !extensionsExpanded && (() => {
              const selectedExt = supportedExtensions.find(e => e.id === extension) || unsupportedExtensions.find(e => e.id === extension);
              if (!selectedExt) return null;
              const isUnsupported = unsupportedExtensions.some(e => e.id === extension);
              return (
                <div
                  style={{
                    background: '#1b2130',
                    border: '2px solid #3a5f7a',
                    borderRadius: '12px',
                    padding: '14px',
                    marginBottom: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>{selectedExt.name}</h4>
                    <a
                      href={selectedExt.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        fontSize: '11px',
                        color: '#3a8fb8',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        flexShrink: 0
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      <span>🔗</span> GitHub
                    </a>
                  </div>
                  {isUnsupported && (
                    <div
                      style={{
                        background: '#2a1f1a',
                        border: '1px solid #8b5a3c',
                        borderRadius: '6px',
                        padding: '8px 10px',
                        fontSize: '11px',
                        color: '#d4a574',
                        lineHeight: '1.4'
                      }}
                    >
                      ⚠️ Third-party extension: May have compatibility issues with the current version of create-eth
                    </div>
                  )}
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.8, lineHeight: '1.5' }}>
                    {selectedExt.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => selectExtension(null)}
                    disabled={running}
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: '12px',
                      background: 'transparent',
                      border: '1px solid #2a2f3a',
                      color: '#e7e7e7',
                      borderRadius: '6px',
                      cursor: running ? 'not-allowed' : 'pointer',
                      alignSelf: 'flex-start',
                      marginTop: '4px'
                    }}
                  >
                    Remove
                  </button>
                </div>
              );
            })()}
            <div 
              style={{ 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: extensionsExpanded ? '12px' : '0',
                userSelect: 'none'
              }}
              onClick={() => setExtensionsExpanded(!extensionsExpanded)}
            >
              <span style={{ fontSize: '14px', opacity: 0.7 }}>
                {extensionsExpanded ? '▼' : '▶'}
              </span>
              <span style={{ fontSize: '13px', opacity: 0.8 }}>
                {extension 
                  ? (supportedExtensions.find(e => e.id === extension)?.name || unsupportedExtensions.find(e => e.id === extension)?.name || extension)
                  : 'Click to select an extension'}
              </span>
            </div>
            {extensionsExpanded && (
              <div className="extensions" style={{ flexDirection: 'column', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ width: '100%' }}>
                  <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '12px', fontWeight: 500 }}>Supported (Curated)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                    {supportedExtensions.map((ext) => (
                      <div
                        key={ext.id}
                        onClick={() => !running && selectExtension(ext.id)}
                        style={{
                          background: extension === ext.id ? '#1b2130' : '#0f1117',
                          border: `2px solid ${extension === ext.id ? '#3a5f7a' : '#2a2f3a'}`,
                          borderRadius: '12px',
                          padding: '14px',
                          cursor: running ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          opacity: running ? 0.6 : 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                        onMouseEnter={(e) => {
                          if (!running) {
                            e.currentTarget.style.borderColor = extension === ext.id ? '#3a5f7a' : '#3a4a5a';
                            e.currentTarget.style.background = extension === ext.id ? '#1b2130' : '#12141a';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!running) {
                            e.currentTarget.style.borderColor = extension === ext.id ? '#3a5f7a' : '#2a2f3a';
                            e.currentTarget.style.background = extension === ext.id ? '#1b2130' : '#0f1117';
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>{ext.name}</h4>
                          <a
                            href={ext.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              fontSize: '11px',
                              color: '#3a8fb8',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              flexShrink: 0
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                          >
                            <span>🔗</span> GitHub
                          </a>
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', opacity: 0.8, lineHeight: '1.5' }}>
                          {ext.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ width: '100%' }}>
                  <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '12px', fontWeight: 500 }}>
                    Community (3rd-party)
                    <span style={{ fontSize: '11px', opacity: 0.6, marginLeft: '8px' }}>⚠️ Verify source before installing</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                    {unsupportedExtensions.map((ext) => (
                      <div
                        key={ext.id}
                        onClick={() => !running && selectExtension(ext.id)}
                        style={{
                          background: extension === ext.id ? '#1b2130' : '#0f1117',
                          border: `2px solid ${extension === ext.id ? '#3a5f7a' : '#2a2f3a'}`,
                          borderRadius: '12px',
                          padding: '14px',
                          cursor: running ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          opacity: running ? 0.6 : 0.9,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                        onMouseEnter={(e) => {
                          if (!running) {
                            e.currentTarget.style.borderColor = extension === ext.id ? '#3a5f7a' : '#3a4a5a';
                            e.currentTarget.style.background = extension === ext.id ? '#1b2130' : '#12141a';
                            e.currentTarget.style.opacity = '1';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!running) {
                            e.currentTarget.style.borderColor = extension === ext.id ? '#3a5f7a' : '#2a2f3a';
                            e.currentTarget.style.background = extension === ext.id ? '#1b2130' : '#0f1117';
                            e.currentTarget.style.opacity = '0.9';
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>{ext.name}</h4>
                          <a
                            href={ext.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              fontSize: '11px',
                              color: '#3a8fb8',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              flexShrink: 0
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                          >
                            <span>🔗</span> GitHub
                          </a>
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', opacity: 0.8, lineHeight: '1.5' }}>
                          {ext.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                {extension && (
                  <div style={{ width: '100%', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => selectExtension(null)}
                      disabled={running}
                      style={{ 
                        padding: '6px 12px', 
                        fontSize: '12px',
                        background: 'transparent',
                        border: '1px solid #2a2f3a',
                        color: '#e7e7e7',
                        borderRadius: '6px',
                        cursor: running ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Clear selection
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="row">
          <button onClick={run} disabled={!canRun}>
            {running ? "Running…" : "Create"}
          </button>
        </div>
      </section>

      {running && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          background: '#12141a',
          borderRadius: '12px',
          border: '1px solid #2a2f3a'
        }}>
          <span className="spinner"></span>
          <span style={{ fontSize: '14px', opacity: 0.9 }}>Creating project...</span>
        </div>
      )}

      {(running || logs) && (
        <section className="terminal" style={{ 
          height: terminalVisible ? '300px' : '60px',
          overflow: terminalVisible ? 'auto' : 'hidden'
        }}>
          <div 
            style={{ 
              cursor: 'pointer',
              padding: '8px 12px',
              borderBottom: terminalVisible ? '1px solid #202636' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              minHeight: '44px',
              gap: '12px'
            }}
            onClick={() => setTerminalVisible(!terminalVisible)}
          >
            <span style={{ 
              fontSize: '12px', 
              opacity: 0.7,
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
            }}>
              {terminalVisible ? 'Console Output' : getLatestLine()}
            </span>
            <span style={{ fontSize: '12px', opacity: 0.7, flexShrink: 0 }}>
              {terminalVisible ? '▼ Collapse' : '▲ Expand'}
            </span>
          </div>
          {terminalVisible && (
            <div 
              style={{ cursor: logs && logs.split('\n').length > 20 ? 'pointer' : 'default' }}
              onClick={() => logs && logs.split('\n').length > 20 && setTerminalExpanded(!terminalExpanded)}
              title={logs && logs.split('\n').length > 20 ? (terminalExpanded ? 'Click to collapse' : 'Click to expand all output') : ''}
            >
              <pre>{getDisplayLogs()}</pre>
              {logs && logs.split('\n').length > 20 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '8px', 
                  color: '#666', 
                  fontSize: '12px',
                  borderTop: '1px solid #ddd'
                }}>
                  {terminalExpanded ? '▼ Click to collapse' : '▲ Click to expand all output'}
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

