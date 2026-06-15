/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Trash2, PlusCircle, Check, ChevronDown, Copy } from "lucide-react";
import Card from "../../components/card/Card";
import Button from "../../components/button/Button";
import styles from "./AddSplit.module.css";
import { useParams } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { useSplits } from "../../hooks/useSplits";
import { useTokens } from "../../hooks/useTokens";
import type { RecipientForm, RecipientType, TokenOption } from "../../types";

const determineType = (value: string): RecipientType => {
  if (value.startsWith("0x") && value.length > 30) return "address";
  if (value.includes("@")) return "email";
  return "contact";
};

export default function AddSplit() {
  const { id } = useParams();
  const { createSplit, creating } = useSplits();
  const [splitName, setSplitName] = useState("");
  const [selectedToken, setSelectedToken] = useState<TokenOption>({
    id: "any",
    symbol: "ANY",
    name: "Any Asset",
    iconUrl: "",
  });
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [participants, setParticipants] = useState<RecipientForm[]>([]);
  const [distributionEngine, setDistributionEngine] = useState("");
  const [thresholdValue, setThresholdValue] = useState("");
  const [scheduledInterval, setScheduledInterval] = useState("Weekly");
  const [createdSplitId, setCreatedSplitId] = useState<string | null>(null);
  const [invitePasscodes, setInvitePasscodes] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const currentAccount = useCurrentAccount();
  const { tokens: userTokens } = useTokens(currentAccount?.address ?? "");
  const isEdit = !!id;

  const tokenOptions: TokenOption[] = [
    { id: "any", symbol: "ANY", name: "Any Asset", iconUrl: "" },
    ...userTokens.map((t, i) => ({
      id: `token-${i}`,
      symbol: t.symbol,
      name: t.name,
      iconUrl: t.iconUrl,
    })),
  ];

  useEffect(() => {
    let cancelled = false;
    const initialize = () => {
      if (id) {
        if (!cancelled) {
          setParticipants([
            { address: "0x71C5...3B21", share: "40", type: "address" },
            { address: "0x44A5...9F02", share: "25", type: "address" },
            { address: "0x99B2...1C44", share: "20", type: "address" },
            { address: "0x22D3...8E11", share: "15", type: "address" },
          ]);
          setSplitName("SPlit Name Here");
          // setSelectedToken(tokenOptions[1]);
        }
      }
      setParticipants([
        {
          address: currentAccount?.address || "",
          share: "60",
          type: "address",
        },
        { address: "", share: "40", type: "contact" },
      ]);
    };

    initialize();
    return () => {
      cancelled = true;
    };
  }, [currentAccount?.address, id]);

  const totalShareSum = participants.reduce(
    (sum, p) => sum + (parseFloat(p.share) || 0),
    0,
  );

  const handleAddParticipant = () => {
    setParticipants([
      ...participants,
      { address: "", share: "", type: "contact" },
    ]);
  };

  const handleRemoveParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const handleParticipantChange = (
    index: number,
    field: "address" | "share",
    value: string,
  ) => {
    const updated = participants.map((p, i) => {
      if (i === index) {
        return {
          ...p,
          [field]: value,
          type: field === "address" ? determineType(value) : p.type,
        };
      }
      return p;
    });
    setParticipants(updated);
  };

  const handleSelectToken = (token: (typeof tokenOptions)[0]) => {
    setSelectedToken(token);
    setShowTokenDropdown(false);
  };

  const getDistType = (): "Manual" | "Threshold" | "Scheduled" | "Incoming" => {
    switch (distributionEngine) {
      case "Manual Trigger":
        return "Manual";
      case "Threshold Trigger":
        return "Threshold";
      case "Scheduled Trigger":
        return "Scheduled";
      default:
        return "Incoming";
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (totalShareSum !== 100 || !currentAccount) return;
    if (isEdit) {
      alert("Edit not supported");
      return;
    }

    try {
      const distType = getDistType();
      const result = await createSplit({
        name: splitName,
        recipients: participants.map((p) => ({
          identifier: p.address,
          type: p.type,
          share: parseFloat(p.share),
        })),
        distributionType: distType,
        threshold:
          distType === "Threshold" ? parseFloat(thresholdValue || "0") : 0,
      });

      setCreatedSplitId(result.splitId);
      setInvitePasscodes(result.passcodes);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Show invite links after creation
  if (createdSplitId) {
    const inviteRecipients = participants.filter((_, i) => invitePasscodes[i]);
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Split Created!</h1>
          <p className={styles.pageSubtitle}>
            Your split is live on testnet. Share these invites.
          </p>
        </div>
        <div className={styles.invitesContainer}>
          {inviteRecipients.map((r, i) => {
            const link = `${window.location.origin}/confirm/${createdSplitId}?code=${invitePasscodes[i]}`;
            return (
              <Card key={i} variant="light" className={styles.inviteCard}>
                <p className={styles.inviteLabel}>
                  {r.address || `Recipient ${i + 1}`}
                </p>
                <p className={styles.inviteLink}>{link}</p>
                <Button
                  variant="primary"
                  onClick={() => {
                    navigator.clipboard.writeText(link);
                    setCopiedIndex(i);
                    setTimeout(() => setCopiedIndex(null), 2000);
                  }}
                >
                  <Copy size={16} />
                  {copiedIndex === i ? "Copied!" : "Copy Link"}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>
          {isEdit ? "Edit Split" : "Add New Split"}
        </h1>
        <p className={styles.pageSubtitle}>
          Configure automated asset distribution and participant shares.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <Card variant="light" className={styles.formCard}>
          <div className={styles.topRowGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Split Name</label>
              <input
                type="text"
                placeholder="e.g. Q3 Operations Split"
                value={splitName}
                onChange={(e) => setSplitName(e.target.value)}
                className={styles.textInput}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Receive Token</label>
              <div className={styles.tokenSelectorContainer}>
                <button
                  type="button"
                  onClick={() => setShowTokenDropdown(!showTokenDropdown)}
                  className={styles.tokenSelectorBtn}
                >
                  <div className={styles.tokenSelectorLeft}>
                    <div
                      className={`${styles.tokenIconWrapper} ${styles[selectedToken.symbol.toLowerCase()]}`}
                    >
                      {selectedToken.symbol === "ANY" ? (
                        <span className={styles.anyIconText}>*</span>
                      ) : selectedToken.iconUrl ? (
                        <img
                          src={selectedToken.iconUrl}
                          alt={selectedToken.symbol}
                          className={styles.tokenIcon}
                        />
                      ) : (
                        <span className={styles.anyIconText}>
                          {selectedToken.symbol[0]}
                        </span>
                      )}
                    </div>
                    <div className={styles.tokenTextStack}>
                      <span className={styles.tokenSymbolText}>
                        {selectedToken.symbol}
                      </span>
                      <span className={styles.tokenNameText}>
                        {selectedToken.name}
                      </span>
                    </div>
                  </div>
                  <ChevronDown size={20} className={styles.chevronIcon} />
                </button>
                {showTokenDropdown && (
                  <div className={styles.tokenSelectorDropdownList}>
                    {tokenOptions.map((token) => (
                      <button
                        key={token.id}
                        type="button"
                        onClick={() => handleSelectToken(token)}
                        className={styles.tokenSelectorDropdownItem}
                      >
                        <div
                          className={`${styles.tokenIconWrapper} ${styles[token.symbol.toLowerCase()]}`}
                        >
                          {token.symbol === "ANY" ? (
                            <span className={styles.anyIconText}>*</span>
                          ) : token.iconUrl ? (
                            <img
                              src={token.iconUrl}
                              alt={token.symbol}
                              className={styles.tokenIcon}
                            />
                          ) : (
                            <span className={styles.anyIconText}>
                              {token.symbol[0]}
                            </span>
                          )}
                        </div>
                        <div className={styles.tokenTextStack}>
                          <span className={styles.tokenSymbolText}>
                            {token.symbol}
                          </span>
                          <span className={styles.tokenNameText}>
                            {token.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.participantsSection}>
            <div className={styles.participantsHeader}>
              <h3>Participants</h3>
              <button
                type="button"
                onClick={handleAddParticipant}
                className={styles.addParticipantBtn}
              >
                <PlusCircle size={16} /> <span>Add Participant</span>
              </button>
            </div>
            <div className={styles.participantsList}>
              {participants.map((p, index) => (
                <div key={index} className={styles.participantRow}>
                  <div className={styles.addressInputCol}>
                    <span className={styles.fieldLabel}>
                      Wallet Address or Name
                    </span>
                    <input
                      type="text"
                      placeholder="Add Address..."
                      value={p.address}
                      onChange={(e) =>
                        handleParticipantChange(
                          index,
                          "address",
                          e.target.value,
                        )
                      }
                      className={styles.textInput}
                      required
                    />
                  </div>
                  <div className={styles.shareInputCol}>
                    <span className={styles.fieldLabel}>Percentage Share</span>
                    <div className={styles.shareInputWrapper}>
                      <input
                        type="number"
                        placeholder="0"
                        min="0"
                        max="100"
                        value={p.share}
                        onChange={(e) =>
                          handleParticipantChange(
                            index,
                            "share",
                            e.target.value,
                          )
                        }
                        className={styles.shareInput}
                        required
                      />
                      <span className={styles.percentSymbol}>%</span>
                    </div>
                  </div>
                  <div className={styles.deleteCol}>
                    <div className={styles.fieldLabelEmpty} />
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(index)}
                      className={styles.deleteBtn}
                      disabled={participants.length <= 1}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.totalSplitWrapper}>
              <div className={styles.totalSplitContainer}>
                <span className={styles.totalSplitLabel}>Total Split</span>
                <div className={styles.progressBarTrack}>
                  <div
                    className={`${styles.progressBarFill} ${totalShareSum === 100 ? styles.progressSuccess : styles.progressWarning}`}
                    style={{ width: `${Math.min(totalShareSum, 100)}%` }}
                  />
                </div>
                <span
                  className={`${styles.totalSplitPercentage} ${totalShareSum === 100 ? styles.textSuccess : styles.textWarning}`}
                >
                  {totalShareSum}%
                </span>
              </div>
            </div>
          </div>

          <div className={styles.engineSection}>
            <label className={styles.label}>Distribution Engine</label>
            <div className={styles.engineSelectWrapper}>
              <select
                value={distributionEngine}
                onChange={(e) => setDistributionEngine(e.target.value)}
                className={styles.engineSelect}
              >
                <option>Automated Trigger</option>
                <option>Manual Trigger</option>
                <option>Threshold Trigger</option>
                <option>Scheduled Trigger</option>
              </select>
              <div className={styles.selectArrowIcon}>
                <ChevronDown size={18} />
              </div>
            </div>
            {distributionEngine === "Threshold Trigger" && (
              <div className={styles.engineFieldGroup}>
                <label className={styles.label}>Threshold Amount</label>
                <div className={styles.thresholdInputWrapper}>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={thresholdValue}
                    onChange={(e) => setThresholdValue(e.target.value)}
                    className={styles.textInput}
                    required
                  />
                  <span className={styles.thresholdTokenSymbol}>
                    {selectedToken.symbol}
                  </span>
                </div>
              </div>
            )}
            {distributionEngine === "Scheduled Trigger" && (
              <div className={styles.engineFieldGroup}>
                <label className={styles.label}>Distribution Interval</label>
                <div className={styles.engineSelectWrapper}>
                  <select
                    value={scheduledInterval}
                    onChange={(e) => setScheduledInterval(e.target.value)}
                    className={styles.engineSelect}
                  >
                    <option>Weekly</option>
                    <option>Monthly</option>
                    <option>Yearly</option>
                  </select>
                  <div className={styles.selectArrowIcon}>
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>
            )}
            <p className={styles.helperText}>
              Funds will be automatically routed as soon as they hit the split
              wallet address.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            className={styles.submitBtn}
            disabled={totalShareSum !== 100 || creating || !currentAccount}
          >
            <Check size={18} />
            <span>
              {creating ? "Creating..." : isEdit ? "Save Changes" : "Add Split"}
            </span>
          </Button>
        </Card>
      </form>
    </div>
  );
}
