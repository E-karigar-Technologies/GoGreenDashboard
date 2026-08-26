import React, { useState, useEffect } from "react";
import { Row, Col, Card, Select, Button, Tag, Badge, Spin, message, Typography, Avatar, Space, Divider, Alert } from "antd";
import { Layers, CheckCircle, Save, LayoutGrid, Sparkles, FolderCheck, Check, RefreshCw } from "lucide-react";
import { getAllCategories, saveproductCategories, getShowSelectedCategory } from "../../services/apiService";

const { Title, Text } = Typography;

const SECTION_CONFIGS = [
  { index: 1, group: "home", title: "Homepage Hero Section 1", badge: "Hero Banner", color: "blue" },
  { index: 2, group: "home", title: "Homepage Featured Section 2", badge: "Featured Grid", color: "cyan" },
  { index: 3, group: "home", title: "Homepage Trending Section 3", badge: "Trending Row", color: "purple" },
  { index: 4, group: "home", title: "Homepage Promo Section 4", badge: "Promo Row", color: "magenta" },
  { index: 5, group: "category_page", title: "Category Page Section 5", badge: "Page Slot 1", color: "green" },
  { index: 6, group: "category_page", title: "Category Page Section 6", badge: "Page Slot 2", color: "teal" },
  { index: 7, group: "category_page", title: "Category Page Section 7", badge: "Page Slot 3", color: "orange" },
  { index: 8, group: "category_page", title: "Category Page Section 8", badge: "Page Slot 4", color: "gold" },
  { index: 9, group: "category_page", title: "Category Page Section 9", badge: "Page Slot 5", color: "volcano" },
];

export default function CategorySelector() {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState({
    1: "",
    2: "",
    3: "",
    4: "",
    5: "",
    6: "",
    7: "",
    8: "",
    9: ""
  });
  const [savedStatus, setSavedStatus] = useState({});
  const [savingIndex, setSavingIndex] = useState(null);
  const [savingAll, setSavingAll] = useState(false);

  // Fetch all available categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await getAllCategories();
        if (response?.success && Array.isArray(response?.data)) {
          setCategories(response.data);
        } else {
          message.error("Failed to load category directory");
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        message.error("Error fetching category list");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch selected categories for sections 1 to 9
  useEffect(() => {
    if (categories.length === 0) return;

    const fetchSelectedCategories = async () => {
      try {
        const initialSelected = {};
        for (let index = 1; index <= 9; index++) {
          const response = await getShowSelectedCategory(index);
          if (response?.success && response?.data) {
            initialSelected[index] = String(response.data.id || response.data.category_id || "");
          } else {
            initialSelected[index] = "";
          }
        }
        setSelectedCategories(initialSelected);
      } catch (err) {
        console.error("Error fetching selected categories:", err);
      }
    };

    fetchSelectedCategories();
  }, [categories]);

  // Handle single category section update
  const handleSaveCategory = async (index) => {
    const categoryId = selectedCategories[index];
    if (!categoryId) {
      message.warning(`Please select a category for Section ${index}`);
      return;
    }

    setSavingIndex(index);
    try {
      const res = await saveproductCategories(categoryId, index);
      if (res?.success !== false) {
        message.success(`Section ${index} category updated successfully!`);
        setSavedStatus(prev => ({ ...prev, [index]: true }));
        setTimeout(() => {
          setSavedStatus(prev => ({ ...prev, [index]: false }));
        }, 3000);
      } else {
        message.error(res?.message || `Failed to update Section ${index}`);
      }
    } catch (err) {
      console.error(err);
      message.error(`Error saving Section ${index}`);
    } finally {
      setSavingIndex(null);
    }
  };

  // Handle save all sections in one click
  const handleSaveAll = async () => {
    setSavingAll(true);
    let successCount = 0;
    try {
      for (let index = 1; index <= 9; index++) {
        const catId = selectedCategories[index];
        if (catId) {
          await saveproductCategories(catId, index);
          successCount++;
        }
      }
      message.success(`All ${successCount} configured category sections saved successfully!`);
    } catch (err) {
      console.error(err);
      message.error("Failed to save some sections");
    } finally {
      setSavingAll(false);
    }
  };

  const handleSelectChange = (index, value) => {
    setSelectedCategories(prev => ({ ...prev, [index]: value }));
  };

  // Helper to find category object by ID
  const getCategoryObj = (catId) => {
    if (!catId) return null;
    return categories.find(c => String(c.id) === String(catId));
  };

  const activeConfiguredCount = Object.values(selectedCategories).filter(Boolean).length;

  if (loadingCategories) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" tip="Loading Category Showcase Configuration..." />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', padding: '24px', minHeight: '100vh' }}>
      {/* Header Banner */}
      <Card bodyStyle={{ padding: '20px 24px' }} style={{ borderRadius: 12, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #088b46 0%, #0aa95a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(8, 139, 70, 0.25)',
                  flexShrink: 0
                }}
              >
                <LayoutGrid size={26} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
                    Category Showcase Manager
                  </Title>
                  <Tag color="green" style={{ borderRadius: 6, fontWeight: 600, padding: '2px 8px' }}>
                    {activeConfiguredCount} of 9 Configured
                  </Tag>
                </div>
                <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                  Assign and manage featured product categories displayed on the Homepage and Category Showcase directory.
                </Text>
              </div>
            </div>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              size="large"
              icon={savingAll ? <Spin size="small" /> : <Save size={18} />}
              onClick={handleSaveAll}
              loading={savingAll}
              style={{
                borderRadius: 8,
                background: '#088b46',
                borderColor: '#088b46',
                fontWeight: 600,
                boxShadow: '0 2px 6px rgba(8, 139, 70, 0.2)'
              }}
            >
              Save All Sections
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Section Group 1: Homepage Showcase Sections */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Sparkles size={20} color="#088b46" />
          <h4 style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '17px' }}>
            Homepage Featured Sections (1 to 4)
          </h4>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Primary banner rows displayed on the mobile & web storefront homepage.
          </span>
        </div>

        <Row gutter={[16, 16]}>
          {SECTION_CONFIGS.filter(s => s.group === "home").map(config => {
            const selectedCatId = selectedCategories[config.index];
            const catObj = getCategoryObj(selectedCatId);
            const isSaving = savingIndex === config.index;
            const isJustSaved = savedStatus[config.index];

            return (
              <Col xs={24} sm={12} lg={6} key={config.index}>
                <Card
                  bodyStyle={{ padding: 18 }}
                  style={{
                    borderRadius: 10,
                    height: '100%',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar
                        size={28}
                        style={{ backgroundColor: '#f1f5f9', color: '#088b46', fontWeight: 700, fontSize: 13 }}
                      >
                        {config.index}
                      </Avatar>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>
                        Section {config.index}
                      </span>
                    </div>
                    <Tag color={config.color} style={{ borderRadius: 6, margin: 0, fontWeight: 600, fontSize: 11 }}>
                      {config.badge}
                    </Tag>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block' }}>
                      Select Category:
                    </label>
                    <Select
                      showSearch
                      placeholder="Choose Category..."
                      value={selectedCatId || undefined}
                      onChange={(val) => handleSelectChange(config.index, val)}
                      style={{ width: '100%', borderRadius: 8 }}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={categories.map(cat => ({
                        value: String(cat.id),
                        label: cat.name || cat.category_name || `Category #${cat.id}`
                      }))}
                    />
                  </div>

                  {/* Selected Category Preview */}
                  {catObj ? (
                    <div
                      style={{
                        padding: '8px 12px',
                        background: '#f8fafc',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 14
                      }}
                    >
                      {catObj.image || catObj.category_image ? (
                        <img
                          src={catObj.image || catObj.category_image}
                          alt="Cat"
                          style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }}
                        />
                      ) : (
                        <FolderCheck size={20} color="#088b46" />
                      )}
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {catObj.name || catObj.category_name}
                        </div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>ID: #{catObj.id}</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '8px 12px', background: '#fffbe6', borderRadius: 8, border: '1px solid #ffe58f', fontSize: 11, color: '#d97706', marginBottom: 14 }}>
                      ⚠️ No category assigned to Section {config.index}
                    </div>
                  )}

                  <Button
                    type="primary"
                    block
                    disabled={!selectedCatId}
                    loading={isSaving}
                    icon={isJustSaved ? <Check size={16} /> : <Save size={16} />}
                    onClick={() => handleSaveCategory(config.index)}
                    style={{
                      borderRadius: 8,
                      background: isJustSaved ? '#52c41a' : '#088b46',
                      borderColor: isJustSaved ? '#52c41a' : '#088b46',
                      fontWeight: 600
                    }}
                  >
                    {isJustSaved ? `Section ${config.index} Saved!` : `Save Section ${config.index}`}
                  </Button>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>

      <Divider style={{ margin: '24px 0', borderColor: '#e2e8f0' }} />

      {/* Section Group 2: Category Directory Page Layout Sections */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Layers size={20} color="#0284c7" />
          <h4 style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '17px' }}>
            Category Page Layout Sections (5 to 9)
          </h4>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Dedicated category page showcase rows & grid layout slots.
          </span>
        </div>

        <Row gutter={[16, 16]}>
          {SECTION_CONFIGS.filter(s => s.group === "category_page").map(config => {
            const selectedCatId = selectedCategories[config.index];
            const catObj = getCategoryObj(selectedCatId);
            const isSaving = savingIndex === config.index;
            const isJustSaved = savedStatus[config.index];

            return (
              <Col xs={24} sm={12} lg={4.8} key={config.index} style={{ minWidth: 220 }}>
                <Card
                  bodyStyle={{ padding: 16 }}
                  style={{
                    borderRadius: 10,
                    height: '100%',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Avatar
                        size={24}
                        style={{ backgroundColor: '#e0f2fe', color: '#0284c7', fontWeight: 700, fontSize: 12 }}
                      >
                        {config.index}
                      </Avatar>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>
                        Section {config.index}
                      </span>
                    </div>
                    <Tag color={config.color} style={{ borderRadius: 6, margin: 0, fontWeight: 600, fontSize: 10 }}>
                      {config.badge}
                    </Tag>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <Select
                      showSearch
                      placeholder="Select Category..."
                      value={selectedCatId || undefined}
                      onChange={(val) => handleSelectChange(config.index, val)}
                      style={{ width: '100%', borderRadius: 8 }}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={categories.map(cat => ({
                        value: String(cat.id),
                        label: cat.name || cat.category_name || `Category #${cat.id}`
                      }))}
                    />
                  </div>

                  {/* Category Preview */}
                  {catObj ? (
                    <div
                      style={{
                        padding: '6px 10px',
                        background: '#f8fafc',
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 12
                      }}
                    >
                      {catObj.image || catObj.category_image ? (
                        <img
                          src={catObj.image || catObj.category_image}
                          alt="Cat"
                          style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover' }}
                        />
                      ) : (
                        <FolderCheck size={18} color="#0284c7" />
                      )}
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {catObj.name || catObj.category_name}
                      </span>
                    </div>
                  ) : (
                    <div style={{ padding: '6px 10px', background: '#f1f5f9', borderRadius: 6, fontSize: 11, color: '#94a3b8', marginBottom: 12, textAlign: 'center' }}>
                      Not Assigned
                    </div>
                  )}

                  <Button
                    type="primary"
                    size="small"
                    block
                    disabled={!selectedCatId}
                    loading={isSaving}
                    icon={isJustSaved ? <Check size={14} /> : <Save size={14} />}
                    onClick={() => handleSaveCategory(config.index)}
                    style={{
                      borderRadius: 6,
                      background: isJustSaved ? '#52c41a' : '#0284c7',
                      borderColor: isJustSaved ? '#52c41a' : '#0284c7',
                      fontWeight: 600,
                      fontSize: 12
                    }}
                  >
                    {isJustSaved ? 'Saved!' : `Save #${config.index}`}
                  </Button>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    </div>
  );
}
