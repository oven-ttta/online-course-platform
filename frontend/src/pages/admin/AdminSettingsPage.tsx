import { useState } from "react";
import {
  ShieldCheckIcon,
  BellIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  ServerIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", name: "ทั่วไป", icon: GlobeAltIcon },
    { id: "security", name: "ความปลอดภัย", icon: ShieldCheckIcon },
    { id: "notifications", name: "การแจ้งเตือน", icon: BellIcon },
    { id: "appearance", name: "รูปลักษณ์", icon: PaintBrushIcon },
    { id: "system", name: "ระบบ", icon: ServerIcon },
  ];

  const handleSave = () => {
    toast.success("บันทึกการตั้งค่าสำเร็จ");
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ตั้งค่าระบบ</h1>

      <div className="flex gap-8">
        {/* Sidebar Tabs */}
        <div className="w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b pb-4">
                การตั้งค่าทั่วไป
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ชื่อเว็บไซต์
                  </label>
                  <input
                    type="text"
                    className="input mt-1"
                    defaultValue="Online Course Platform"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    คำอธิบายเว็บไซต์
                  </label>
                  <textarea
                    className="input mt-1"
                    rows={3}
                    defaultValue="แพลตฟอร์มเรียนออนไลน์ที่ดีที่สุด"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    อีเมลติดต่อ
                  </label>
                  <input
                    type="email"
                    className="input mt-1"
                    defaultValue="contact@example.com"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b pb-4">ความปลอดภัย</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      บังคับใช้ Two-Factor Authentication
                    </p>
                    <p className="text-sm text-gray-500">
                      สำหรับผู้ดูแลระบบและผู้สอน
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    defaultChecked
                  />
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="font-medium">การเข้าสู่ระบบ</p>
                    <p className="text-sm text-gray-500">
                      จำกัดจำนวนครั้งในการลองรหัสผ่าน
                    </p>
                  </div>
                  <input
                    type="number"
                    className="input inline-block w-20"
                    defaultValue={5}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t flex justify-end">
            <button onClick={handleSave} className="btn btn-primary">
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
