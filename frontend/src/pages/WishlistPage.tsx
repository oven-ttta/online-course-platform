import { useState, useEffect } from "react";
import { wishlistApi } from "../services/api";
import CourseCard from "../components/features/CourseCard";

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const response = await wishlistApi.getMyWishlist();
      setItems(response.data.data);
    } catch (error) {
      console.error("Error loading wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        รายการที่บันทึกไว้
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow h-64" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">
            คุณยังไม่มีคอร์สที่บันทึกไว้
          </p>
          <a href="/courses" className="btn btn-primary">
            ค้นหาคอร์สเลย
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="relative">
              <CourseCard course={item.course} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
