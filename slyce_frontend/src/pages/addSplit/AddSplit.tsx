import React, { useState } from "react";
import { Trash2, PlusCircle, Check, ChevronDown } from "lucide-react";
import Card from "../../components/card/Card";
import Button from "../../components/button/Button";
import styles from "./AddSplit.module.css";
import { tokens } from "../../lib/mockData";
import { useParams } from "react-router-dom";

interface Participant {
  address: string;
  share: string;
}

const tokenOptions = [
  {
    id: 0,
    symbol: "ANY",
    name: "Any Asset",
    iconUrl: "",
  },
  ...tokens,
];

export default function AddSplit() {
  const { id } = useParams();
  const isEdit = !!id;

  const [splitName, setSplitName] = useState(
    isEdit ? "Project Alpha Royalties" : "",
  );
  const [selectedToken, setSelectedToken] = useState(
    isEdit
      ? tokenOptions.find((t) => t.symbol === "USDC") || tokenOptions[0]
      : tokenOptions[0],
  );
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>(
    isEdit
      ? [
          { address: "0x71C5...3B21", share: "40" },
          { address: "0x44A5...9F02", share: "25" },
          { address: "0x99B2...1C44", share: "20" },
          { address: "0x22D3...8E11", share: "15" },
        ]
      : [
          { address: "0x742d...44e", share: "60" },
          { address: "", share: "40" },
        ],
  );
  const [distributionEngine, setDistributionEngine] = useState(
    isEdit ? "Automated Trigger (Smart Contract)" : "Automated Trigger",
  );

  const [thresholdValue, setThresholdValue] = useState("");
  const [scheduledInterval, setScheduledInterval] = useState("Weekly");

  const totalShareSum = participants.reduce(
    (sum, p) => sum + (parseFloat(p.share) || 0),
    0,
  );

  const handleAddParticipant = () => {
    setParticipants([...participants, { address: "", share: "" }]);
  };

  const handleRemoveParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const handleParticipantChange = (
    index: number,
    field: keyof Participant,
    value: string,
  ) => {
    const updated = participants.map((p, i) => {
      if (i === index) {
        return { ...p, [field]: value };
      }
      return p;
    });
    setParticipants(updated);
  };

  const handleSelectToken = (token: (typeof tokenOptions)[0]) => {
    setSelectedToken(token);
    setShowTokenDropdown(false);
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (totalShareSum !== 100) return;

    if (isEdit) {
      alert(
        `Split updated successfully!\nName: ${splitName}\nToken: ${selectedToken.symbol}`,
      );
    } else {
      alert(
        `Split created successfully!\nName: ${splitName}\nToken: ${selectedToken.symbol}`,
      );
    }
  };

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
          {/* Top Row: Name and Token Selector */}
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
                      className={`${styles.tokenIconWrapper} ${
                        styles[selectedToken.symbol.toLowerCase()]
                      }`}
                    >
                      {selectedToken.symbol === "ANY" ? (
                        <span className={styles.anyIconText}>*</span>
                      ) : (
                        <img
                          src={selectedToken.iconUrl}
                          alt={selectedToken.symbol}
                          className={styles.tokenIcon}
                        />
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
                          ) : (
                            <img
                              src={token.iconUrl}
                              alt={token.symbol}
                              className={styles.tokenIcon}
                            />
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

          {/* Participants Section */}
          <div className={styles.participantsSection}>
            <div className={styles.participantsHeader}>
              <h3>Participants</h3>
              <button
                type="button"
                onClick={handleAddParticipant}
                className={styles.addParticipantBtn}
              >
                <PlusCircle size={16} />
                <span>Add Participant</span>
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
                      title="Remove participant"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Split Progress Bar */}
            <div className={styles.totalSplitWrapper}>
              <div className={styles.totalSplitContainer}>
                <span className={styles.totalSplitLabel}>Total Split</span>
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

          {/* Distribution Engine Section */}
          <div className={styles.engineSection}>
            <label className={styles.label}>Distribution Engine</label>
            <div className={styles.engineSelectWrapper}>
              <select
                value={distributionEngine}
                onChange={(e) => setDistributionEngine(e.target.value)}
                className={styles.engineSelect}
              >
                <option>Automated Trigger (Smart Contract)</option>
                <option>Manual Trigger</option>
                <option>Threshold Trigger</option>
                <option>Scheduled Trigger</option>
              </select>
              <div className={styles.selectArrowIcon}>
                <ChevronDown size={18} />
              </div>
            </div>

            {/* Conditional Distribution Engine Fields */}
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

          {/* Add Split / Save Changes Action Button */}
          <Button
            type="submit"
            variant="primary"
            className={styles.submitBtn}
            disabled={totalShareSum !== 100}
          >
            <Check size={18} />
            <span>{isEdit ? "Save Changes" : "Add Split"}</span>
          </Button>
        </Card>
      </form>
    </div>
  );
}
