import { useState, useEffect } from "react";
import { walletApi } from "../../services/api";
import {
  CreditCardIcon,
  BanknotesIcon,
  ArrowPathIcon,
  GiftIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function DepositPage() {
  const [balance, setBalance] = useState<number>(0);
  const [amount, setAmount] = useState<string>("");
  const [voucherUrl, setVoucherUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"demo" | "voucher">("voucher");
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const [balanceRes, transRes] = await Promise.all([
        walletApi.getBalance(),
        walletApi.getTransactions(),
      ]);
      setBalance(Number(balanceRes.data.data.balance));
      setTransactions(transRes.data.data);
    } catch (error) {
      console.error("Error loading wallet data:", error);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error("กรุณาระบุจำนวนเงินที่ถูกต้อง");
      return;
    }

    setLoading(true);
    try {
      await walletApi.deposit(numAmount);
      toast.success(`เติมเงินสำเร็จ ${numAmount} บาท`);
      setAmount("");
      loadWalletData();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเติมเงิน");
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherUrl) {
      toast.error("กรุณาระบุลิงก์ซองอั่งเปา");
      return;
    }

    setLoading(true);
    try {
      await walletApi.redeem(voucherUrl);
      toast.success("แลกคูปองสำเร็จ! ยอดเงินถูกเพิ่มเข้าไปในกระเป๋าแล้ว");
      setVoucherUrl("");
      loadWalletData();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error?.message || "เกิดข้อผิดพลาดในการแลกคูปอง";
      const errorCode = error.response?.data?.error?.code;

      if (errorCode === "VOUCHER_OUT_OF_STOCK") {
        toast.error("คูปองนี้ถูกใช้ไปแล้ว");
      } else if (errorCode === "VOUCHER_NOT_FOUND") {
        toast.error("ไม่พบคูปองนี้ กรุณาตรวจสอบลิงก์อีกครั้ง");
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        กระเป๋าเงินของฉัน
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Balance Card */}
        <div className="md:col-span-1 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl shadow-xl p-6 text-white">
          <p className="text-primary-100 text-sm font-medium mb-1">
            ยอดเงินคงเหลือ
          </p>
          <h2 className="text-4xl font-bold mb-4">
            ฿{balance.toLocaleString()}
          </h2>
          <div className="flex items-center gap-2 text-primary-100 text-xs bg-white/10 rounded-lg p-2">
            <CreditCardIcon className="h-4 w-4" />
            <span>พร้อมใช้งานสำหรับการซื้อคอร์ส</span>
          </div>
        </div>

        {/* Deposit Form Area */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("voucher")}
              className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                activeTab === "voucher"
                  ? "bg-primary-50 text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <GiftIcon className="h-5 w-5" />
              TrueMoney Voucher
            </button>
            <button
              onClick={() => setActiveTab("demo")}
              className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                activeTab === "demo"
                  ? "bg-primary-50 text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <BanknotesIcon className="h-5 w-5" />
              Demo (เติมเงินจำลอง)
            </button>
          </div>

          <div className="p-6">
            {activeTab === "voucher" ? (
              <form onSubmit={handleRedeemVoucher} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ลิงก์ซองอั่งเปา TrueMoney Wallet
                  </label>
                  <input
                    type="url"
                    value={voucherUrl}
                    onChange={(e) => setVoucherUrl(e.target.value)}
                    placeholder="https://gift.truemoney.com/campaign/?v=..."
                    className="input"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                    * วิธีใช้งาน: เปิดแอป TrueMoney &gt; ส่งซองอั่งเปา &gt;
                    เลือกประเภทแบบ "สุ่ม" หรือ "แบ่งเท่ากัน" ก็ได้ &gt;
                    คัดลอกลิงก์มาวางที่นี่
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  ) : (
                    "ยืนยันการรับเงินจากซอง"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleDeposit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    จำนวนเงินที่ต้องการเติม (บาท)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      ฿
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="ระบุจำนวนเงิน เช่น 500"
                      className="input pl-8"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[100, 500, 1000, 2000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val.toString())}
                      className="px-4 py-1.5 text-sm font-medium rounded-full bg-gray-50 text-gray-600 hover:bg-primary-50 hover:text-primary-600 border border-gray-200 hover:border-primary-200 transition-colors"
                    >
                      +฿{val}
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  ) : (
                    "ยืนยันการเติมเงิน (Demo)"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">ประวัติรายการ</h3>
          <button
            onClick={loadWalletData}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            รีเฟรช
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  วันที่
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  รายการ
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  ประเภท
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">
                  จำนวน
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    ยังไม่มีประวัติรายการ
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(tx.createdAt).toLocaleDateString("th-TH", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {tx.description || "รายการเติมเงิน"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          tx.type === "DEPOSIT"
                            ? "bg-green-100 text-green-700"
                            : tx.type === "PURCHASE"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-sm text-green-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        {tx.status}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-bold text-right ${
                        tx.type === "DEPOSIT"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {tx.type === "DEPOSIT" ? "+" : "-"}฿
                      {Number(tx.amount).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
