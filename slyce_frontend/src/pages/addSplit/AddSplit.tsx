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
import toast from "react-hot-toast";
import { useFetchSplitById } from "../../hooks/useFetchSplitById";

const determineType = (value: string): RecipientType => {
  if (value.startsWith("0x") && value.length > 30) return "address";
  if (value.includes("@")) return "email";
  return "contact";
};

export default function AddSplit() {
  const { id } = useParams();
  const { createSplit, creating, updateSplit, updating } = useSplits();
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
  const { split } = useFetchSplitById(id || "");

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
    const initialize = async () => {
      if (id && split) {
        if (!cancelled) {
          setSplitName(split.name);
          const dtMap: Record<number, string> = {
            0: "Manual Trigger",
            1: "Threshold Trigger",
            2: "Scheduled Trigger",
            3: "Automated Trigger",
          };
          setDistributionEngine(
            dtMap[Number(split.distributionType)] || "Automated Trigger"
          );
          setThresholdValue((split.threshold || 0).toString());
          setParticipants(
            split.recipients.map((r: any) => ({
              address: r.contact,
              share: (Number(r.share) / 100).toString(),
              type:
                r.contact.startsWith("0x") && r.contact.length > 30
                  ? "address"
                  : "contact",
              passcodeHash: r.passcode_hash || "",
            }))
          );
          if (split.targetCurrency) {
            const t = tokenOptions.find(
              (t) => t.symbol === split.targetCurrency
            );
            if (t) setSelectedToken(t);
          }
        }
      } else if (!id) {
        setParticipants([
          {
            address: currentAccount?.address || "",
            share: "60",
            type: "address",
          },
          { address: "", share: "40", type: "contact" },
        ]);
      }
    };

    initialize();
    return () => {
      cancelled = true;
    };
  }, [currentAccount?.address, id, split]);

  const totalShareSum = participants.reduce(
    (sum, p) => sum + (parseFloat(p.share) || 0),
    0
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
    value: string
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
      if (!id) return;
      const toastId = toast.loading("Updating collaboration...");
      try {
        const distType = getDistType();
        const result = await updateSplit(
          {
            name: splitName,
            recipients: participants.map((p) => ({
              identifier: p.address,
              type: p.type,
              share: parseFloat(p.share),
              passcodeHash: p.passcodeHash,
            })),
            distributionType: distType,
            threshold:
              distType === "Threshold" ? parseFloat(thresholdValue || "0") : 0,
            currency: selectedToken.symbol,
          },
          id
        );
        setCreatedSplitId(result.splitId);
        setInvitePasscodes(result.passcodes);
        toast.success("Collaboration updated successfully", { id: toastId });
      } catch (err: any) {
        console.log(err);
        toast.error(err.message, { id: toastId });
      }
      return;
    }

    const toastId = toast.loading("Starting collaboration...");

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
        currency: selectedToken.symbol,
      });
      setCreatedSplitId(result.splitId);
      setInvitePasscodes(result.passcodes);
      toast.success("Collaboration started successfully", { id: toastId });

      // Send invite emails to any email-type recipients
      const emailRecipients = participants
        .map((p, i) => ({ ...p, passcode: result.passcodes[i] }))
        .filter((p) => p.type === "email" && p.address && p.passcode);

      if (emailRecipients.length > 0) {
        try {
          await fetch(`${import.meta.env.VITE_EMAIL_API_URL || "http://localhost:3001"}/api/invite`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              splitId: result.splitId,
              splitName,
              recipients: emailRecipients.map((r) => ({
                email: r.address,
                share: parseFloat(r.share),
                passcode: r.passcode,
                recipientIndex: participants.indexOf(r),
              })),
            }),
          });
          toast.success(`Invite sent to ${emailRecipients.length} collaborator${emailRecipients.length > 1 ? "s" : ""}`);
        } catch {
          toast.error("Collaboration created, but invite emails could not be sent.");
        }
      }
    } catch (err: any) {
      console.log(err);
      toast.error(err.message, {
        id: toastId,
      });
    }
  };

  // Show invite links after creation
  if (createdSplitId) {
    const inviteRecipients = participants.filter((_, i) => invitePasscodes[i]);
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>
            {isEdit ? "Collaboration Updated!" : "Collaboration Started!"}
          </h1>
          <p className={styles.pageSubtitle}>
            {isEdit
              ? inviteRecipients.length > 0
                ? "Your collaboration has been successfully updated. Share these invites with your new collaborators."
                : "Your collaboration has been successfully updated."
              : "Your collaboration is live on testnet. Share these invites."}
          </p>
        </div>

        {inviteRecipients.length > 0 ? (
          <div className={styles.invitesContainer}>
            <div className={styles.invitesHeader}>
              <h3>Participant Invite Links</h3>
              <p>Share these unique links securely. Each link contains a one-time passcode.</p>
            </div>
            <div className={styles.invitesList}>
              {inviteRecipients.map((r, i) => {
                const originalIndex = participants.findIndex((p) => p === r);
                const link = `${window.location.origin}/confirm/${createdSplitId}?code=${invitePasscodes[originalIndex]}&idx=${originalIndex}`;
                const isCopied = copiedIndex === i;
                
                return (
                  <div key={i} className={styles.inviteItem}>
                    <div className={styles.inviteItemLeft}>
                      <div className={styles.inviteAvatar}>
                         {r.address ? r.address.substring(0, 2).toUpperCase() : "U"}
                      </div>
                      <div className={styles.inviteDetails}>
                        <span className={styles.inviteName}>
                          {r.address ? (r.address.startsWith("0x") ? `${r.address.slice(0,6)}...${r.address.slice(-4)}` : r.address) : `Collaborator ${originalIndex + 1}`}
                        </span>
                        <span className={styles.inviteRole}>
                          {r.share}% Share
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.inviteItemRight}>
                      <div className={styles.linkBox}>
                         <span className={styles.linkText}>{link}</span>
                      </div>
                      <button 
                        type="button"
                        className={`${styles.copyIconButton} ${isCopied ? styles.copied : ""}`}
                        onClick={() => {
                          navigator.clipboard.writeText(link);
                          setCopiedIndex(i);
                          setTimeout(() => setCopiedIndex(null), 2000);
                        }}
                        title="Copy Link"
                      >
                        {isCopied ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={styles.actionFooter}>
              <Button variant="primary" onClick={() => window.history.back()} className={styles.doneBtn}>
                Done & Return
              </Button>
            </div>
          </div>
        ) : (
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 32 }}
          >
            <Button variant="primary" onClick={() => window.history.back()}>
              Return to Collaborations
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>
          {isEdit ? "Edit Collaboration" : "Start New Collaboration"}
        </h1>
        <p className={styles.pageSubtitle}>
          Configure automated asset routing and collaborator shares.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <Card variant="light" className={styles.formCard}>
          <div className={styles.topRowGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Collaboration Name</label>
              <input
                type="text"
                placeholder="e.g. Q3 Operations Collaboration"
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
                      className={`${styles.tokenIconWrapper} ${
                        styles[selectedToken.symbol.toLowerCase()]
                      }`}
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
                          className={`${styles.tokenIconWrapper} ${
                            styles[token.symbol.toLowerCase()]
                          }`}
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
                          e.target.value
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
                            e.target.value
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
                <span className={styles.totalSplitLabel}>Total Cut</span>
                <div className={styles.progressBarTrack}>
                  <div
                    className={`${styles.progressBarFill} ${
                      totalShareSum === 100
                        ? styles.progressSuccess
                        : styles.progressWarning
                    }`}
                    style={{ width: `${Math.min(totalShareSum, 100)}%` }}
                  />
                </div>
                <span
                  className={`${styles.totalSplitPercentage} ${
                    totalShareSum === 100
                      ? styles.textSuccess
                      : styles.textWarning
                  }`}
                >
                  {totalShareSum}%
                </span>
              </div>
            </div>
          </div>

          <div className={styles.engineSection}>
            <label className={styles.label}>Payout Engine</label>
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
                <label className={styles.label}>Payout Interval</label>
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
              Funds will be automatically routed as soon as they hit the collaboration deal
              wallet address.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            className={styles.submitBtn}
            disabled={
              totalShareSum !== 100 || creating || updating || !currentAccount
            }
          >
            <Check size={18} />
            <span>
              {creating || updating
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                ? "Save Changes"
                : "Start Collaboration"}
            </span>
          </Button>
        </Card>
      </form>
    </div>
  );
}
