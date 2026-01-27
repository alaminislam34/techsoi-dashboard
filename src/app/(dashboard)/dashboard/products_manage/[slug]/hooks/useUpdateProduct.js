import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import apiService from "@/api/api";

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  const isPng = (file) =>
    file &&
    typeof file.name === "string" &&
    file.name.toLowerCase().endsWith(".png");

  const getInvalidFiles = (files) =>
    (files || []).filter((file) => file instanceof File && !isPng(file));

  return useMutation({
    mutationFn: async ({
      productId,
      formData,
      specifications,
      images,
      existingImages,
    }) => {
      console.log("=== STARTING UPDATE PROCESS ===");
      console.log("Product ID:", productId);
      console.log("Form data before update:", formData);

      // Validate required fields
      if (!formData.name) throw new Error("Product name is required");
      if (!formData.regular_price) throw new Error("Regular price is required");
      if (!formData.sale_price) throw new Error("Sale price is required");
      if (!formData.category_id) throw new Error("Category is required");
      if (!formData.short_description)
        throw new Error("Short description is required");

      // Prepare the complete update data
      const updateData = new FormData();

      // Laravel needs _method when sending multipart via POST
      updateData.append("_method", "PUT");

      // Add all basic fields
      updateData.append("name", String(formData.name).trim());
      updateData.append("regular_price", String(formData.regular_price).trim());
      updateData.append("discount", String(formData.discount || 0).trim());
      updateData.append("sale_price", String(formData.sale_price).trim());
      updateData.append("category_id", String(formData.category_id).trim());
      updateData.append(
        "sub_category_id",
        String(formData.sub_category_id || "").trim(),
      );
      updateData.append("brand_id", String(formData.brand_id || "").trim());
      updateData.append(
        "short_description",
        String(formData.short_description).trim(),
      );
      updateData.append("stock", String(formData.stock || 0).trim());
      updateData.append(
        "emi_status",
        String(formData.emi_status || "0").trim(),
      );

      // Add details fields
      updateData.append(
        "full_description",
        String(formData.full_description || "").trim(),
      );

      // Format specifications with "name" and "value" keys
      const formattedSpecs = specifications.map((spec) => ({
        name: spec.key || spec.name,
        value: spec.value,
      }));
      updateData.append("specifications", JSON.stringify(formattedSpecs));

      // Keep existing extra images (URLs) so backend doesn't drop them
      if (existingImages && existingImages.length > 0) {
        updateData.append("existing_images", JSON.stringify(existingImages));
        console.log("=== EXISTING EXTRA IMAGES BEING SENT ===");
        console.log("Count:", existingImages.length);
        console.log("URLs:", existingImages);
      } else {
        console.log("=== NO EXISTING EXTRA IMAGES TO PRESERVE ===");
      }

      // Log all fields being sent in table format
      console.log("=== DATA BEING SENT TO API ===");
      const dataTable = {};
      for (let [key, value] of updateData.entries()) {
        if (key !== "main_image" && !key.includes("extra_images")) {
          dataTable[key] = value;
        }
      }
      console.table(dataTable);
      console.log("Specifications:", formattedSpecs);

      // Validate and log images info
      if (images.length > 0 && images[0] instanceof File) {
        if (!isPng(images[0])) {
          toast.error(
            `Main image must be .png only. Invalid: ${images[0].name}`,
          );
          throw new Error("Main image not PNG");
        }
        console.log("Main Image:", {
          name: images[0].name,
          size: images[0].size,
          type: images[0].type,
        });
        updateData.append("main_image", images[0]);
      } else if (images.length > 0) {
        console.log("Main Image (existing URL):", images[0]);
      }

      const newExtraImages = [];

      if (images.length > 1) {
        images.slice(1).forEach((img) => {
          if (img instanceof File) {
            if (!isPng(img)) {
              toast.error(
                `Extra images must be .png only. Invalid: ${img.name}`,
              );
              throw new Error("Extra image not PNG");
            }
            newExtraImages.push(img);
          }
        });
      }

      // Append only new extra images as files
      if (newExtraImages.length > 0) {
        newExtraImages.forEach((img) => {
          updateData.append("extra_images[]", img);
        });
        console.log(
          "Extra Images (New Files):",
          newExtraImages.map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
          })),
        );
      }

      console.log("Endpoint:", `product/${productId}`);

      const response = await apiService.post(
        `product/${productId}`,
        updateData,
      );

      console.log("Update response:", response.data);
      console.log("=== UPDATE COMPLETED SUCCESSFULLY ===");

      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Product Updated Successfully!");
      queryClient.invalidateQueries(["product"]);
      queryClient.invalidateQueries(["products"]);
    },
    onError: (error) => {
      console.error("=== UPDATE FAILED ===");
      console.error("Error:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to update product");
    },
  });
};
