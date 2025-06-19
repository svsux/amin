"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import InputField from "./InputField";
import PrimaryButton from "./PrimaryButton";
import AnimatedSelect from "./AnimatedSelect";
import type { Product, Store, Option } from "../types";

interface Props {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (productId: string, formData: FormData) => void;
  isLoading: boolean;
  allStores: Store[];
}

export default function ProductEditModal({
  open,
  product,
  onClose,
  onSave,
  isLoading,
  allStores,
}: Props) {
  const [name, setName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPurchasePrice(String(product.purchasePrice));
      setSalePrice(String(product.salePrice));
      setQuantity(String(product.quantity));
      setCurrentImageUrl(product.imageUrl || "");
      setSelectedStores(product.storeProducts?.map((sp) => sp.store.id) || []);
      setNewImageFile(null);
      const fileInput = document.getElementById(
        "edit-product-image"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }
  }, [product]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("purchasePrice", purchasePrice);
    formData.append("salePrice", salePrice);
    formData.append("quantity", quantity);
    formData.append("stores", JSON.stringify(selectedStores));

    if (newImageFile) {
      formData.append("image", newImageFile);
    }

    onSave(product.id, formData);
  };

  const storeOptions: Option[] = allStores.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const modalVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 30, scale: 0.95 },
  };

  return (
    <AnimatePresence>
      {open && product && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-[#121418] border border-[#1E2228] rounded-2xl shadow-xl w-full max-w-2xl p-8 relative"
            variants={modalVariants}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <FiX size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">
              Редактировать товар
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Название товара"
                  id="edit-product-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <InputField
                  label="Количество"
                  id="edit-product-quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
                <InputField
                  label="Цена закупки"
                  id="edit-product-purchase-price"
                  type="number"
                  step="0.01"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  required
                />
                <InputField
                  label="Цена продажи"
                  id="edit-product-sale-price"
                  type="number"
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Изображение товара
                </label>
                {currentImageUrl && !newImageFile && (
                  <img
                    src={currentImageUrl}
                    alt={name}
                    className="w-24 h-24 object-cover rounded-lg mb-2"
                  />
                )}
                <input
                  type="file"
                  id="edit-product-image"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setNewImageFile(e.target.files[0]);
                    }
                  }}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#0066FF]/10 file:text-[#0066FF] hover:file:bg-[#0066FF]/20 cursor-pointer"
                />
                <p className="text-xs text-gray-500">
                  Выберите новый файл, чтобы заменить текущее изображение.
                </p>
              </div>

              <AnimatedSelect
                isMulti
                options={storeOptions}
                value={storeOptions.filter((o) => selectedStores.includes(o.value))}
                onChange={(opts) => setSelectedStores(opts ? opts.map((o) => o.value) : [])}
                placeholder="Выберите магазины..."
              />
              <PrimaryButton type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Сохранение..." : "Сохранить изменения"}
              </PrimaryButton>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
