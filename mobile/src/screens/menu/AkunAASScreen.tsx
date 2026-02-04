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
  CreditCard,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react-native";

interface AkunAAS {
  id: number;
  kode_akun: string;
  nama_akun: string;
  jenis: "debet" | "kredit";
  is_active: boolean;
  unit_id: number;
}

export default function AkunAASScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { akunAAS, isAkunAASLoading, createAkunAAS, updateAkunAAS } =
    useMaster();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAkun, setEditingAkun] = useState<AkunAAS | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    kode_akun: "",
    nama_akun: "",
    jenis: "debet" as "debet" | "kredit",
  });

  const filteredAkun = akunAAS.filter(
    (akun: AkunAAS) =>
      (akun.nama_akun || "").toLowerCase().includes(search.toLowerCase()) ||
      (akun.kode_akun || "").toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenModal = (akun?: AkunAAS) => {
    if (akun) {
      setEditingAkun(akun);
      setFormData({
        kode_akun: akun.kode_akun,
        nama_akun: akun.nama_akun,
        jenis: akun.jenis,
      });
    } else {
      setEditingAkun(null);
      setFormData({
        kode_akun: "",
        nama_akun: "",
        jenis: "debet",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.kode_akun.trim() || !formData.nama_akun.trim()) {
      Alert.alert("Error", "Kode dan Nama Akun wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAkun) {
        await updateAkunAAS({ id: editingAkun.id, data: formData as any });
        Alert.alert("Sukses", "Akun berhasil diperbarui");
      } else {
        await createAkunAAS({
          ...formData,
          unit_id: user?.unit_id ?? 0,
        } as any);
        Alert.alert("Sukses", "Akun berhasil ditambahkan");
      }
      setIsModalOpen(false);
      setFormData({ kode_akun: "", nama_akun: "", jenis: "debet" });
      setEditingAkun(null);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Gagal menyimpan akun",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (akun: AkunAAS) => {
    Alert.alert(
      "Hapus Akun",
      `Apakah Anda yakin ingin menghapus akun "${akun.nama_akun}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await masterService.deleteAkunAAS(akun.id);
              Alert.alert("Sukses", "Akun berhasil dihapus");
            } catch (error: any) {
              Alert.alert(
                "Error",
                error?.response?.data?.message || "Gagal menghapus akun",
              );
            }
          },
        },
      ],
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // The hook will automatically refetch
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderItem = ({ item }: { item: AkunAAS }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="font-mono text-sm font-bold text-blue-600">
              {item.kode_akun}
            </Text>
            <View
              className={`ml-2 px-2 py-0.5 rounded-full flex-row items-center ${
                item.jenis === "debet" ? "bg-emerald-100" : "bg-red-100"
              }`}
            >
              {item.jenis === "debet" ? (
                <ArrowUp size={10} color="#059669" />
              ) : (
                <ArrowDown size={10} color="#DC2626" />
              )}
              <Text
                className={`text-xs font-semibold ml-0.5 capitalize ${
                  item.jenis === "debet" ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {item.jenis}
              </Text>
            </View>
          </View>
          <Text className="text-gray-800 font-medium">{item.nama_akun}</Text>
          <View
            className={`self-start mt-2 px-2 py-0.5 rounded-full ${
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
        <CreditCard size={40} color="#9CA3AF" />
      </View>
      <Text className="text-lg font-semibold text-gray-800 mb-1">
        Tidak ada data
      </Text>
      <Text className="text-gray-500 text-center mb-4">
        Belum ada akun AAS yang terdaftar
      </Text>
      <TouchableOpacity
        className="bg-blue-600 px-6 py-3 rounded-xl flex-row items-center"
        onPress={() => handleOpenModal()}
      >
        <Plus size={18} color="white" />
        <Text className="text-white font-semibold ml-2">
          Tambah Akun Pertama
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
            <Text className="text-xl font-bold text-gray-900">Akun AAS</Text>
            <Text className="text-sm text-gray-500">
              Kelola master akun akuntansi
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
            placeholder="Cari kode atau nama akun..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <Text className="text-sm text-gray-500 mt-2">
          Total:{" "}
          <Text className="font-semibold text-gray-800">
            {filteredAkun.length}
          </Text>{" "}
          akun
        </Text>
      </View>

      {/* List */}
      {isAkunAASLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={filteredAkun}
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
      {filteredAkun.length > 0 && (
        <TouchableOpacity
          className="absolute right-6 bg-blue-600 w-14 h-14 rounded-2xl items-center justify-center shadow-lg"
          style={{ bottom: 20 + insets.bottom }}
          onPress={() => handleOpenModal()}
        >
          <Plus size={28} color="white" />
        </TouchableOpacity>
      )}

      {/* Modal */}
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
                {editingAkun ? "Edit Akun AAS" : "Tambah Akun AAS"}
              </Text>
              <TouchableOpacity
                className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center"
                onPress={() => setIsModalOpen(false)}
              >
                <X size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Kode Akun <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800"
                placeholder="Contoh: 1.1.1"
                placeholderTextColor="#9CA3AF"
                value={formData.kode_akun}
                onChangeText={(text) =>
                  setFormData({ ...formData, kode_akun: text })
                }
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Nama Akun <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800"
                placeholder="Contoh: Kas Kecil"
                placeholderTextColor="#9CA3AF"
                value={formData.nama_akun}
                onChangeText={(text) =>
                  setFormData({ ...formData, nama_akun: text })
                }
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Jenis Akun <Text className="text-red-500">*</Text>
              </Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-xl border flex-row items-center justify-center ${
                    formData.jenis === "debet"
                      ? "bg-emerald-50 border-emerald-500"
                      : "bg-gray-50 border-gray-200"
                  }`}
                  onPress={() => setFormData({ ...formData, jenis: "debet" })}
                >
                  <ArrowUp
                    size={18}
                    color={formData.jenis === "debet" ? "#059669" : "#9CA3AF"}
                  />
                  <Text
                    className={`font-semibold ml-2 ${
                      formData.jenis === "debet"
                        ? "text-emerald-700"
                        : "text-gray-500"
                    }`}
                  >
                    Debet
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-xl border flex-row items-center justify-center ${
                    formData.jenis === "kredit"
                      ? "bg-red-50 border-red-500"
                      : "bg-gray-50 border-gray-200"
                  }`}
                  onPress={() => setFormData({ ...formData, jenis: "kredit" })}
                >
                  <ArrowDown
                    size={18}
                    color={formData.jenis === "kredit" ? "#DC2626" : "#9CA3AF"}
                  />
                  <Text
                    className={`font-semibold ml-2 ${
                      formData.jenis === "kredit"
                        ? "text-red-700"
                        : "text-gray-500"
                    }`}
                  >
                    Kredit
                  </Text>
                </TouchableOpacity>
              </View>
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
                    {editingAkun ? "Simpan" : "Tambah"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
