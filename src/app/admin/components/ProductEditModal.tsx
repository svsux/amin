import React, { useState, useEffect, useRef } from "react";
import InputField from "./InputField";
import PrimaryButton from "./PrimaryButton";
import AnimatedSelect from "./AnimatedSelect";
import { Product } from "../types";
import { motion } from "framer-motion";
import Image from "next/image";

type StoreOption = { label: string; value: string };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  storeOptions: StoreOption[];
  onSubmit: (updatedData: {
    name: string;
    purchasePrice: string;
    salePrice: string;
    quantity: string;
    image: File | null;
    stores: string[];
  }) => void;
  isLoading: boolean;
}

const ProductEditModal: React.FC<Props> = ({
  isOpen,
  onClose,
  editingProduct,
  storeOptions,
  onSubmit,
  isLoading,
}) => {
  const [name, setName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && editingProduct) {
      setName(editingProduct.name);
      setPurchasePrice(String(editingProduct.purchasePrice));
      setSalePrice(String(editingProduct.salePrice));
      setQuantity(String(editingProduct.quantity));
      setSelectedStores(
        editingProduct.storeProducts?.map((sp) => String(sp.store.id)) || []
      );
      setImage(null);
      setImagePreview(editingProduct.imageUrl || null);
    }
  }, [editingProduct, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(editingProduct?.imageUrl || null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      purchasePrice,
      salePrice,
      quantity,
      image,
      stores: selectedStores,
    });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bg-[#121418] rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[#1E2228]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            Редактировать товар
          </h2>
          <button
            onClick={onClose}
            className="text-[#A0A8B8] hover:text-white text-2xl transition-colors"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            id="edit-product-name"
            label="Название товара"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="edit-product-purchase-price"
              label="Закупочная цена (₽)"
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              required
            />
            <InputField
              id="edit-product-sale-price"
              label="Цена продажи (₽)"
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              required
            />
          </div>
          <InputField
            id="edit-product-quantity"
            label="Количество на складе"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-[#A0A8B8] mb-1">
              Магазины
            </label>
            <AnimatedSelect
              isMulti
              options={storeOptions}
              value={storeOptions.filter((opt) =>
                selectedStores.includes(opt.value)
              )}
              onChange={(opts) =>
                setSelectedStores(opts ? opts.map((o) => o.value) : [])
              }
              placeholder="Выберите магазины"
              classNamePrefix="react-select"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#A0A8B8] mb-1">
              Изображение товара
            </label>
            <input
              id="edit-product-image-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mb-2 px-4 py-2 text-sm font-medium text-white bg-[#0066FF] rounded-md shadow-sm hover:bg-blue-500 transition-colors"
            >
              {imagePreview
                ? "Изменить изображение"
                : "Выбрать изображение"}
            </button>
            {imagePreview && (
              <div className="mt-2 border border-[#1E2228] rounded-md p-2 inline-block">
                <Image
                  src={imagePreview}
                  alt="Предпросмотр"
                  width={96}
                  height={96}
                  className="h-24 w-24 object-cover rounded"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-[#1E2228] text-sm text-[#A0A8B8] hover:bg-[#1E2228] transition-colors"
            >
              Отмена
            </button>
            <PrimaryButton type="submit" disabled={isLoading}>
              {isLoading ? "Сохранение..." : "Сохранить изменения"}
            </PrimaryButton>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ProductEditModal;
