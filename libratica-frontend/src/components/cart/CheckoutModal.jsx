import React, { useState } from 'react';

const CheckoutModal = ({ isOpen, onClose, onSubmit, sellerName }) => {
  const [formData, setFormData] = useState({
    name: '',
    zipCode: '',
    city: '',
    street: '',
    paymentMethod: 'cash',
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Név kötelező';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'Irányítószám kötelező';
    if (!formData.city.trim()) newErrors.city = 'Város kötelező';
    if (!formData.street.trim()) newErrors.street = 'Utca, házszám kötelező';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const shippingAddress = `${formData.name}, ${formData.zipCode} ${formData.city}, ${formData.street}`;
    onSubmit({ shippingAddress, paymentMethod: formData.paymentMethod });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2">Rendelés véglegesítése</h2>

        {sellerName && (
          <p className="text-gray-600 mb-4 text-sm">
            Eladó: <span className="font-semibold">{sellerName}</span>
          </p>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teljes név *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Kovács János"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Irányítószám *
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="1234"
                maxLength={4}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
              />
              {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Város *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Budapest"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Utca, házszám *
            </label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="Fő utca 12."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
            />
            {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fizetési mód
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={handleChange}
                />
                <div>
                  <p className="font-medium text-sm">Készpénz</p>
                  <p className="text-xs text-gray-500">Fizetés átvételkor személyesen</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="transfer"
                  checked={formData.paymentMethod === 'transfer'}
                  onChange={handleChange}
                />
                <div>
                  <p className="font-medium text-sm">Banki átutalás</p>
                  <p className="text-xs text-gray-500">Az eladó bankszámlájára utalás</p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-xs text-yellow-800">
              A platform nem kezel pénzügyi tranzakciókat. A fizetés közvetlenül az eladóval történik.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
          >
            Mégse
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-[#8b4513] text-white rounded hover:bg-[#654321] transition font-semibold"
          >
            Rendelés leadása
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;