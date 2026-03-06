import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import moment from "moment";
import { Button, Image } from "react-bootstrap-v5";
import { useIntl } from "react-intl";
import MasterLayout from "../MasterLayout";
import { fetchAllMainProducts } from "../../store/action/productAction";
import ReactDataTable from "../../shared/table/ReactDataTable";
import DeleteMainProduct from "./DeleteMainProduct";
import TabTitle from "../../shared/tab-title/TabTitle";
import ProductImageLightBox from "./ProductImageLightBox";
import user from "../../assets/images/brand_logo.png";
import {
    getFormattedDate,
    getFormattedMessage,
    placeholderText,
    currencySymbolHandling,
    getPermission,
} from "../../shared/sharedMethod";
import ActionButton from "../../shared/action-buttons/ActionButton";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import ImportProductModel from "./ImportProductModel";
import { productExcelAction } from "../../store/action/productExcelAction";
import { Permissions } from "../../constants";
import { useNavigate } from "react-router";
import EditMultipleProduct from "./EditMultipleProduct";
import { fetchAllBrands } from "../../store/action/brandsAction";
import { fetchAllProductCategories } from "../../store/action/productCategoryAction";
import { fetchUnits } from "../../store/action/unitsAction";
import { duplicateMultipleProducts } from "../../store/action/productAction";

const Product = (props) => {
    const {
        fetchAllMainProducts,
        products,
        totalRecord,
        isLoading,
        frontSetting,
        productExcelAction,
        productUnitId,
        allConfigData,
        callAPIAfterImport,
        isCallFetchDataApi,
        fetchAllBrands,
        fetchAllProductCategories,
        fetchUnits,
        brands,
        productCategories,
        units,
        duplicateMultipleProducts
    } = props;

    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [lightBoxImage, setLightBoxImage] = useState([]);
    const [isMultipleEditMode, setIsMultipleEditMode] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showEditMultipleModal, setShowEditMultipleModal] = useState(false);
    const navigate = useNavigate();
    const intl = useIntl();

    const [importProduct, setimportProduct] = useState(false);
    const handleClose = () => {
        setimportProduct(!importProduct);
    };

    const [isWarehouseValue, setIsWarehouseValue] = useState(false);
    useEffect(() => {
        if (isWarehouseValue === true) {
            productExcelAction(setIsWarehouseValue, true, productUnitId);
        }
    }, [isWarehouseValue]);

    const onExcelClick = () => {
        setIsWarehouseValue(true);
    };

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete(isDelete);
    };

    const onChange = (filter) => {
        fetchAllMainProducts(filter, true);
    };

    const goToEditProduct = (item) => {
        const id = item.id;
        navigate("/app/user/products/edit/" + id);
    };

    const goToProductDetailPage = (ProductId) => {
        navigate("/app/user/products/detail/" + ProductId);
    };

    const handleToggleMultipleEdit = () => {
        setIsMultipleEditMode(!isMultipleEditMode);
        if (isMultipleEditMode) {
            setSelectedProducts([]);
        }
    };

    const handleProductSelect = (productId) => {
        setSelectedProducts(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            } else {
                return [...prev, productId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedProducts.length === itemsValue.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(itemsValue.map(item => item.id));
        }
    };

    const handleOpenEditModal = () => {
        if (selectedProducts.length > 0) {
            setShowEditMultipleModal(true);
        }
    };

    const handleCloseEditModal = () => {
        setShowEditMultipleModal(false);
    };

    const handleDuplicateProducts = () => {
        if (selectedProducts.length > 0) {
            let messageTemplate;
            try {
                messageTemplate = intl.formatMessage(
                    { id: "product.duplicate.confirm.message", defaultMessage: "Tem certeza que deseja duplicar {count} produto(s)? Os novos produtos terão códigos diferentes." },
                    { count: selectedProducts.length }
                );
            } catch (e) {
                messageTemplate = `Tem certeza que deseja duplicar ${selectedProducts.length} produto(s)? Os novos produtos terão códigos diferentes.`;
            }
            
            // Garantir que é uma string
            if (typeof messageTemplate !== 'string') {
                messageTemplate = `Tem certeza que deseja duplicar ${selectedProducts.length} produto(s)? Os novos produtos terão códigos diferentes.`;
            }
            
            if (window.confirm(messageTemplate)) {
                duplicateMultipleProducts(selectedProducts, () => {
                    setIsMultipleEditMode(false);
                    setSelectedProducts([]);
                    fetchAllMainProducts({}, true);
                });
            }
        }
    };

    useEffect(() => {
        if (isMultipleEditMode) {
            fetchAllBrands();
            fetchAllProductCategories();
            fetchUnits();
        }
    }, [isMultipleEditMode]);

    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    const formattedPrice = (product_price) => {
        return currencySymbolHandling(
            allConfigData,
            currencySymbol,
            product_price
        );
    };
    const itemsValue =
        currencySymbol &&
        products.length >= 0 &&
        products.map((product) => {
            let product_price =
                product.attributes.min_price == product.attributes.max_price
                    ? formattedPrice(product.attributes.min_price)
                    : formattedPrice(product.attributes.min_price) +
                      " - " +
                      formattedPrice(product.attributes.max_price);
            return {
                name: product?.attributes.name,
                code: product?.attributes.code,
                date: getFormattedDate(
                    product?.attributes?.products && product?.attributes?.products[0]?.created_at,
                    allConfigData && allConfigData
                ),
                time: moment(product?.attributes?.products && product?.attributes?.products[0]?.created_at).format("LT"),
                brand_name:
                    product?.attributes.products &&
                    product?.attributes?.products[0]?.brand_name
                        ? product?.attributes?.products[0]?.brand_name
                        : "",
                product_price: product_price,
                product_unit: product?.attributes.product_unit?.name
                    ? product?.attributes.product_unit?.name
                    : "N/A",
                in_stock: product.attributes.products?.reduce(
                    (sum, product) =>
                        product?.in_stock
                            ? sum + product?.in_stock
                            : 0,
                    0
                ),
                images: product?.attributes.images,
                id: product.id,
                currency: currencySymbol,
            };
        });

    const columns = [
        {
            name: isMultipleEditMode ? (
                <input
                    type="checkbox"
                    checked={selectedProducts.length === itemsValue.length && itemsValue.length > 0}
                    onChange={handleSelectAll}
                    onClick={(e) => e.stopPropagation()}
                />
            ) : getFormattedMessage("product.title"),
            sortField: "name",
            sortable: false,
            width: isMultipleEditMode ? "80px" : "auto",
            cell: (row) => {
                if (isMultipleEditMode) {
                    return (
                        <input
                            type="checkbox"
                            checked={selectedProducts.includes(row.id)}
                            onChange={() => handleProductSelect(row.id)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    );
                }
                const imageUrl = row.images
                    ? row.images.imageUrls && row.images.imageUrls[0]
                    : null;
                return imageUrl ? (
                    <div className="d-flex align-items-center">
                        <Button
                            type="button"
                            className="btn-transparent me-2 d-flex align-items-center justify-content-center"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(!isOpen);
                                setLightBoxImage(row.images.imageUrls);
                            }}
                        >
                            <Image
                                src={imageUrl}
                                height="50"
                                width="50"
                                alt="Product Image"
                                className="image image-circle image-mini cursor-pointer"
                            />
                        </Button>
                    </div>
                ) : (
                    <div className="d-flex align-items-center">
                        <div className="me-2">
                            <Image
                                src={user}
                                height="50"
                                width="50"
                                alt="Product Image"
                                className="image image-circle image-mini"
                            />
                        </div>
                    </div>
                );
            },
        },
        {
            name: getFormattedMessage("globally.input.name.label"),
            selector: (row) => row.name,
            className: "product-name",
            sortField: "name",
            sortable: true,
        },
        {
            name: getFormattedMessage("globally.code.label"),
            selector: (row) => (
                <span className="badge bg-light-danger d-flex">
                    <span className="overflow-hidden text-truncate">{row.code}</span>
                </span>
            ),
            sortField: "code",
            sortable: true,
        },
        {
            name: getFormattedMessage("brand.title"),
            selector: (row) => row.brand_name,
            sortField: "brand_name",
            sortable: false,
        },
        {
            name: getFormattedMessage("price.title"),

            selector: (row) => row.product_price,
        },
        {
            name: getFormattedMessage("product.input.product-unit.label"),
            sortField: "product_unit",
            sortable: true,
            cell: (row) => {
                return (
                    row.product_unit && (
                        <span className="badge bg-light-success">
                            <span>{row.product_unit}</span>
                        </span>
                    )
                );
            },
        },
        {
            name: getFormattedMessage("product.product-in-stock.label"),
            selector: (row) => row.in_stock,
            sortField: "in_stock",
            sortable: false,
        },
        {
            name: getFormattedMessage(
                "globally.react-table.column.created-date.label"
            ),
            selector: (row) => row.date,
            sortField: "created_at",
            sortable: true,
            cell: (row) => {
                return (
                    <span className="badge bg-light-info">
                        <div className="mb-1">{row.time}</div>
                        {row.date}
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("react-data-table.action.column.label"),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: "120px",
            cell: (row) => (
                <ActionButton
                    isViewIcon={getPermission(allConfigData?.permissions, Permissions.VIEW_PRODUCTS)}
                    goToDetailScreen={goToProductDetailPage}
                    item={row}
                    goToEditProduct={goToEditProduct}
                    isEditMode={getPermission(allConfigData?.permissions, Permissions.EDIT_PRODUCTS)}
                    onClickDeleteModel={onClickDeleteModel}
                    isDeleteMode={getPermission(allConfigData?.permissions, Permissions.DELETE_PRODUCTS)}
                />
            ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("products.title")} />
            <div className="d-flex justify-content-end mb-3">
                {!isMultipleEditMode ? (
                    getPermission(allConfigData?.permissions, Permissions.EDIT_PRODUCTS) && (
                        <Button
                            variant="primary"
                            onClick={handleToggleMultipleEdit}
                            className="me-2"
                        >
                            {getFormattedMessage("product.edit.multiple.title")}
                        </Button>
                    )
                ) : (
                    <>
                        <Button
                            variant="secondary"
                            onClick={handleToggleMultipleEdit}
                            className="me-2"
                        >
                            {getFormattedMessage("product.cancel.selection.title")}
                        </Button>
                        {selectedProducts.length > 0 && (
                            <>
                                <Button
                                    variant="primary"
                                    onClick={handleOpenEditModal}
                                    className="me-2"
                                >
                                    {getFormattedMessage("product.edit.selected.title")} ({selectedProducts.length})
                                </Button>
                                <Button
                                    variant="success"
                                    onClick={handleDuplicateProducts}
                                >
                                    {getFormattedMessage("product.duplicate.selected.title")} ({selectedProducts.length})
                                </Button>
                            </>
                        )}
                    </>
                )}
            </div>
            <ReactDataTable
                columns={columns}
                items={itemsValue}
                onChange={onChange}
                isLoading={isLoading}
                totalRows={totalRecord}
                {...(getPermission(allConfigData?.permissions, Permissions.CREATE_PRODUCTS) &&
                {
                    to: "/app/user/products/create",
                    buttonValue: getFormattedMessage("product.create.title")
                }
                )}
                isShowFilterField={getPermission(allConfigData?.permissions, Permissions.CREATE_PRODUCTS)}
                isUnitFilter
                title={getFormattedMessage("product.input.product-unit.label")}
                goToImport={handleClose}
                isExportDropdown={true}
                isImportDropdown={true}
                onExcelClick={onExcelClick}
                isProductCategoryFilter
                isBrandFilter
                brandFilterTitle={getFormattedMessage(
                    "brand.title"
                )}
                productCategoryFilterTitle={getFormattedMessage(
                    "product-category.title"
                )}
                callAPIAfterImport={callAPIAfterImport}
                isCallFetchDataApi={isCallFetchDataApi}
            />
            <DeleteMainProduct
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={isDelete}
            />
            {isOpen && lightBoxImage.length !== 0 && (
                <ProductImageLightBox
                    setIsOpen={setIsOpen}
                    isOpen={isOpen}
                    lightBoxImage={lightBoxImage}
                />
            )}
            {importProduct && (
                <ImportProductModel
                    handleClose={handleClose}
                    show={importProduct}
                />
            )}
            {showEditMultipleModal && (
                <EditMultipleProduct
                    show={showEditMultipleModal}
                    handleClose={handleCloseEditModal}
                    selectedProductIds={selectedProducts}
                    brands={brands}
                    productCategories={productCategories}
                    units={units}
                />
            )}
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        products,
        totalRecord,
        isLoading,
        frontSetting,
        productUnitId,
        allConfigData,
        callAPIAfterImport,
        isCallFetchDataApi,
        brands,
        productCategories,
        units
    } = state;
    return {
        products,
        totalRecord,
        isLoading,
        frontSetting,
        productUnitId,
        allConfigData,
        callAPIAfterImport,
        isCallFetchDataApi,
        brands: brands || [],
        productCategories: productCategories || [],
        units: units || []
    };
};

export default connect(mapStateToProps, {
    fetchAllMainProducts,
    productExcelAction,
    fetchAllBrands,
    fetchAllProductCategories,
    fetchUnits,
    duplicateMultipleProducts,
})(Product);
