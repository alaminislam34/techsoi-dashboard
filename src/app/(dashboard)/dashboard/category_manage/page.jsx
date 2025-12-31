"use client";

import Category from "./components/Category";
import UpdateCategoryFrom from "./components/UpdateCategoryFrom";

const CategoryManage = () => {
  return (
    <div className="space-y-6">
      <UpdateCategoryFrom />
      <Category />
    </div>
  );
};

export default CategoryManage;
