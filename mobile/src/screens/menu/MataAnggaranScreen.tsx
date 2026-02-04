import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useMaster, masterService } from "@/lib/api-client";
import { useAuth } from "@/lib/api-client";
import {
  ChevronLeft,
  Plus,
  Search,
  Pencil,
  Trash2,
  Wallet,
  ChevronDown,
  X,
  Check,
} from "lucide-react-native";

interface AkunAAS {
  id: number;
  kode_akun: string;
  nama_akun: string;
  jenis: "debet" | "kredit";
}

export default function MataAnggaranScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    akunAAS,
    isAkunAASLoading,
    mataAnggaran,
    isMataAnggaranLoading,
    createMataAnggaran,
    updateMataAnggaran,
  } = useMaster();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAkunPickerOpen, setIsAkunPickerOpen] = useState(false);
  const [editingAnggaran, setEditingAnggaran] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    kode_matanggaran: "",
    nama_matanggaran: "",
    akun_aas_id: 0,
    saldo: 0,
  });

  const filteredAnggaran = mataAnggaran.filter(
    (item: any) =>
      (item.nama_matanggaran || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (item.kode_matanggaran || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const selectedAkun = akunAAS.find(
    (akun: AkunAAS) => akun.id === formData.akun_aas_id,
  );

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingAnggaran(item);
      setFormData({
        kode_matanggaran: item.kode_matanggaran || "",
        nama_matanggaran: item.nama_matanggaran || "",
        akun_aas_id: item.akun_aas_id,
        saldo: item.saldo || 0,
      });
    } else {
      setEditingAnggaran(null);
      setFormData({
        kode_matanggaran: "",
        nama_matanggaran: "",
        akun_aas_id: 0,
        saldo: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (
      !formData.kode_matanggaran.trim() ||
      !formData.nama_matanggaran.trim()
    ) {
      Alert.alert("Error", "Kode dan Nama Mata Anggaran wajib diisi");
      return;
    }

    if (formData.akun_aas_id === 0) {
      Alert.alert("Error", "Silakan pilih Akun AAS terlebih dahulu");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAnggaran) {
        await updateMataAnggaran({
          id: editingAnggaran.id,
          data: formData as any,
        });
        Alert.alert("Sukses", "Mata anggaran berhasil diperbarui");
      } else {
        await createMataAnggaran({
          ...formData,
          unit_id: user?.unit_id ?? 0,
        } as any);
        Alert.alert("Sukses", "Mata anggaran berhasil ditambahkan");
      }
      setIsModalOpen(false);
      setFormData({
        kode_matanggaran: "",
        nama_matanggaran: "",
        akun_aas_id: 0,
        saldo: 0,
      });
      setEditingAnggaran(null);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Gagal menyimpan mata anggaran",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (item: any) => {
    Alert.alert(
      "Hapus Mata Anggaran",
      `Apakah Anda yakin ingin menghapus "${item.nama_matanggaran}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await masterService.deleteMataAnggaran(item.id);
              Alert.alert("Sukses", "Mata anggaran berhasil dihapus");
            } catch (error: any) {
              Alert.alert(
                "Error",
                error?.response?.data?.message ||
                  "Gagal menghapus mata anggaran",
              );
            }
          },
        },
      ],
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="font-mono text-sm font-bold text-blue-600">
              {item.kode_matanggaran}
            </Text>
            <View
              className={`ml-2 px-2 py-0.5 rounded-full ${
                item.is_active ? "bg-emerald-100" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  item.is_active ? "text-emerald-700" : "text-gray-500"
                }`}
              >
                {item.is_active ? "Aktif" : "Nonaktif"}
              </Text>
            </View>
          </View>
          <Text className="text-gray-800 font-medium mb-1">
            {item.nama_matanggaran}
          </Text>
          {item.akun_aas && (
            <View className="flex-row items-center mt-1">
              <View className="bg-gray-100 px-2 py-1 rounded-lg">
                <Text className="text-xs text-gray-600">
                  AAS: {item.akun_aas.kode_akun} - {item.akun_aas.nama_akun}
                </Text>
              </View>
            </View>
          )}
          <Text className="text-xs text-gray-400 mt-1">
            Tahun: {item.tahun}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center"
            onPress={() => handleOpenModal(item)}
          >
            <Pencil size={18} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-10 h-10 bg-red-50 rounded-xl items-center justify-center"
            onPress={() => handleDelete(item)}
          >
            <Trash2 size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View className="w-20 h-20 bg-gray-100 rounded-3xl items-center justify-center mb-4">
        <Wallet size={40} color="#9CA3AF" />
      </View>
      <Text className="text-lg font-semibold text-gray-800 mb-1">
        Tidak ada data
      </Text>
      <Text className="text-gray-500 text-center mb-4">
        Belum ada mata anggaran yang terdaftar
      </Text>
      <TouchableOpacity
        className="bg-blue-600 px-6 py-3 rounded-xl flex-row items-center"
        onPress={() => handleOpenModal()}
      >
        <Plus size={18} color="white" />
        <Text className="text-white font-semibold ml-2">
          Tambah Mata Anggaran
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center mr-3"
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">
              Mata Anggaran
            </Text>
            <Text className="text-sm text-gray-500">
              Kelola master mata anggaran
            </Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View className="px-4 py-3">
        <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-base text-gray-800"
            placeholder="Cari kode atau nama..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <Text className="text-sm text-gray-500 mt-2">
          Total:{" "}
          <Text className="font-semibold text-gray-800">
            {filteredAnggaran.length}
          </Text>{" "}
          mata anggaran
        </Text>
      </View>

      {/* List */}
      {isMataAnggaranLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={filteredAnggaran}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* FAB */}
      {filteredAnggaran.length > 0 && (
        <TouchableOpacity
          className="absolute right-6 bg-blue-600 w-14 h-14 rounded-2xl items-center justify-center shadow-lg"
          style={{ bottom: 20 + insets.bottom }}
          onPress={() => handleOpenModal()}
        >
          <Plus size={28} color="white" />
        </TouchableOpacity>
      )}

      {/* Form Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-white rounded-t-3xl p-6"
            style={{ paddingBottom: insets.bottom + 20 }}
          >
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">
                {editingAnggaran
                  ? "Edit Mata Anggaran"
                  : "Tambah Mata Anggaran"}
              </Text>
              <TouchableOpacity
                className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center"
                onPress={() => setIsModalOpen(false)}
              >
                <X size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Akun AAS Selector */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Akun AAS <Text className="text-red-500">*</Text>
              </Text>
              <TouchableOpacity
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
                onPress={() => setIsAkunPickerOpen(true)}
              >
                <Text
                  className={selectedAkun ? "text-gray-800" : "text-gray-400"}
                >
                  {selectedAkun
                    ? `${selectedAkun.kode_akun} - ${selectedAkun.nama_akun}`
                    : "Pilih Akun AAS"}
                </Text>
                <ChevronDown size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Kode */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Kode Mata Anggaran <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800"
                placeholder="Contoh: MA-001"
                placeholderTextColor="#9CA3AF"
                value={formData.kode_matanggaran}
                onChangeText={(text) =>
                  setFormData({ ...formData, kode_matanggaran: text })
                }
              />
            </View>

            {/* Nama */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Nama Mata Anggaran <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800"
                placeholder="Contoh: Belanja ATK"
                placeholderTextColor="#9CA3AF"
                value={formData.nama_matanggaran}
                onChangeText={(text) =>
                  setFormData({ ...formData, nama_matanggaran: text })
                }
              />
            </View>

            {/* Saldo Awal */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Saldo Awal
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800"
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={formData.saldo.toString()}
                onChangeText={(text) =>
                  setFormData({
                    ...formData,
                    saldo: parseInt(text.replace(/[^0-9]/g, "")) || 0,
                  })
                }
              />
            </View>

            {/* Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-4 bg-gray-100 rounded-xl items-center"
                onPress={() => setIsModalOpen(false)}
              >
                <Text className="font-semibold text-gray-700">Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-4 rounded-xl items-center ${
                  isSubmitting ? "bg-blue-400" : "bg-blue-600"
                }`}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="font-semibold text-white">
                    {editingAnggaran ? "Simpan" : "Tambah"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Akun AAS Picker Modal */}
      <Modal
        visible={isAkunPickerOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAkunPickerOpen(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-white rounded-t-3xl max-h-[70%]"
            style={{ paddingBottom: insets.bottom + 20 }}
          >
            <View className="flex-row items-center justify-between p-6 border-b border-gray-100">
              <Text className="text-lg font-bold text-gray-900">
                Pilih Akun AAS
              </Text>
              <TouchableOpacity
                className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center"
                onPress={() => setIsAkunPickerOpen(false)}
              >
                <X size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            {isAkunAASLoading ? (
              <View className="py-10 items-center">
                <ActivityIndicator size="large" color="#2563EB" />
              </View>
            ) : (
              <ScrollView className="px-4">
                {akunAAS.map((akun: AkunAAS) => (
                  <TouchableOpacity
                    key={akun.id}
                    className={`flex-row items-center justify-between p-4 rounded-xl mb-2 ${
                      formData.akun_aas_id === akun.id
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-gray-50"
                    }`}
                    onPress={() => {
                      setFormData({ ...formData, akun_aas_id: akun.id });
                      setIsAkunPickerOpen(false);
                    }}
                  >
                    <View>
                      <Text className="font-mono text-sm font-bold text-blue-600">
                        {akun.kode_akun}
                      </Text>
                      <Text className="text-gray-800">{akun.nama_akun}</Text>
                    </View>
                    {formData.akun_aas_id === akun.id && (
                      <View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center">
                        <Check size={18} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
