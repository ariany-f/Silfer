import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom'
import { Button, Table } from 'react-bootstrap-v5';
import { fetchMainProduct } from '../../store/action/productAction';
import ProductForm from './ProductForm';
import HeaderTitle from '../header/HeaderTitle';
import MasterLayout from '../MasterLayout';
import { productUnitDropdown } from '../../store/action/productUnitAction';
import { fetchAllunits } from '../../store/action/unitsAction';
import { getFormattedMessage, placeholderText, currencySymbolHandling, getFormattedDate, getPermission } from '../../shared/sharedMethod';
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import { fetchAllBaseUnits } from "../../store/action/baseUnitsAction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import WareHouseDetailsModal from "./WareHouseDetailsModal";
import EditSubProductModal from "./EditSubProductModal";
import DeleteProduct from "./DeleteProduct";
import CreateSubProductModal from "./CreateSubProductModal";
import EditMultipleVariation from "./EditMultipleVariation";
import { Permissions } from "../../constants";

const EditProduct = (props) => {
    const { fetchMainProduct, products, fetchAllBaseUnits, base, frontSetting, allConfigData } = props;
    const { id } = useParams();
    const [singleProduct, setSingleProduct] = useState({});
    const [showWarehouseModal, setShowWarehouseModal] = useState(false);
    const [showEditSubProductModal, setShowEditSubProductModal] = useState(false);
    const [showCreateSubProductModal, setShowCreateSubProductModal] = useState(false);
    const [showEditMultipleVariationModal, setShowEditMultipleVariationModal] = useState(false);
    const [productData, setProductData] = useState({});
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [isMultipleEditMode, setIsMultipleEditMode] = useState(false);
    const [selectedVariations, setSelectedVariations] = useState([]);

    useEffect(() => {
        fetchAllBaseUnits();
        fetchMainProduct(id);
    }, []);

    useEffect(() => {
        if (products.length == 1) {
            setSingleProduct(products);
        }
    }, [products]);

    const subProduct = singleProduct.length >= 1 && singleProduct[0]?.attributes?.products[0];
    const getSaleUnit = subProduct && subProduct.sale_unit_name ? { label: subProduct.sale_unit_name.name, value: subProduct.sale_unit_name.id } : ''
    const getPurchaseUnit = subProduct && subProduct.purchase_unit_name ? { label: subProduct.purchase_unit_name.name, value: subProduct.purchase_unit_name.id } : ''

    const mainProductItemsValue = singleProduct.length >= 1 && singleProduct.map(product => ({
        name: product?.attributes.name,
        code: product?.attributes.code,
        expiry_date: product?.attributes?.products[0]?.expiry_date,
        product_type: product?.attributes.product_type,
        product_category_id: {
            value: subProduct?.product_category_id,
            label: subProduct?.product_category_name
        },
        brand_id: {
            value: subProduct?.brand_id,
            label: subProduct?.brand_name
        },
        barcode_symbol: subProduct?.barcode_symbol,
        product_unit: Number(subProduct?.product_unit),
        sale_unit: getSaleUnit,
        purchase_unit: getPurchaseUnit,
        quantity_limit: subProduct?.quantity_limit,
        notes: subProduct?.notes,
        images: product?.attributes.images,
        status_id: {
            label: getFormattedMessage("status.filter.received.label"),
            value: 1,
        },
        isEdit: true,
        id: product.id,
    }));

    const getProductUnit = mainProductItemsValue && base.filter((fill) => Number(fill?.id) === Number(mainProductItemsValue[0]?.product_unit))

    // Preparar dados para o datatable de variações
    const product = singleProduct.length >= 1 ? singleProduct[0] : null;
    const allProducts = product && product.attributes && product.attributes.products && product.attributes.products.map((item) => item);

    const masterVariationTypes = product?.attributes?.variation?.variation_types || [];
    const usedVariationTypeIds = new Set(
        (allProducts || [])
            .map((item) => item?.variation_product?.variation_type_id)
            .filter((id) => id !== undefined && id !== null)
            .map((id) => Number(id))
    );
    const availableVariationTypes = masterVariationTypes.filter(
        (vt) => !usedVariationTypeIds.has(Number(vt.id))
    );

    const commonDataForNewProduct = {
        name: allProducts && allProducts[0]?.name,
        product_code: allProducts && allProducts[0]?.product_code,
        product_type: allProducts && product?.attributes?.product_type,
        barcode_symbol: allProducts && allProducts[0]?.barcode_symbol,
        product_category_id: allProducts && allProducts[0]?.product_category_id,
        brand_id: allProducts && allProducts[0]?.brand_id,
        product_unit: allProducts && allProducts[0]?.product_unit,
        sale_unit: allProducts && allProducts[0]?.sale_unit,
        purchase_unit: allProducts && allProducts[0]?.purchase_unit,
        quantity_limit: allProducts && allProducts[0]?.quantity_limit,
        notes: allProducts && allProducts[0]?.notes,
        main_product_id: product && product.id,
        variation: product && product?.attributes?.variation,
        variationTypes: availableVariationTypes,
    };

    const openWareHouseDetailModal = (data) => {
        setShowWarehouseModal(true);
        setProductData(data);
    };

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete(isDelete);
    };

    const openEditSubProductModal = (data) => {
        setProductData(data);
        setShowEditSubProductModal(true);
    };

    const openCreateSubProductModal = () => {
        setProductData(commonDataForNewProduct);
        setShowCreateSubProductModal(true);
    };

    const handleToggleMultipleEdit = () => {
        setIsMultipleEditMode(!isMultipleEditMode);
        if (isMultipleEditMode) {
            setSelectedVariations([]);
        }
    };

    const handleVariationSelect = (variationId) => {
        setSelectedVariations(prev => {
            if (prev.includes(variationId)) {
                return prev.filter(id => id !== variationId);
            } else {
                return [...prev, variationId];
            }
        });
    };

    const handleSelectAllVariations = () => {
        if (selectedVariations.length === allProducts.length) {
            setSelectedVariations([]);
        } else {
            setSelectedVariations(allProducts.map(item => item.id));
        }
    };

    const handleOpenEditMultipleVariationModal = () => {
        if (selectedVariations.length > 0) {
            setShowEditMultipleVariationModal(true);
        }
    };

    const handleCloseEditMultipleVariationModal = () => {
        setShowEditMultipleVariationModal(false);
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <HeaderTitle title={getFormattedMessage('product.edit.title')} to='/app/user/products' />
            {mainProductItemsValue.length >= 1 && (
                <>
                    <ProductForm singleProduct={mainProductItemsValue} productUnit={getProductUnit} baseUnits={base} id={id} />
                    
                    {/* Datatable de Variações */}
                    {allProducts && allProducts.length !== 0 && (
                        <div className="card card-body mt-2">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                    {!isMultipleEditMode ? (
                                        getPermission(allConfigData?.permissions, Permissions.EDIT_PRODUCTS) && (
                                            <Button
                                                variant="primary"
                                                onClick={handleToggleMultipleEdit}
                                                className="me-2"
                                            >
                                                {getFormattedMessage("product.edit.multiple.variation.title")}
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
                                            {selectedVariations.length > 0 && (
                                                <Button
                                                    variant="primary"
                                                    onClick={handleOpenEditMultipleVariationModal}
                                                >
                                                    {getFormattedMessage("product.edit.selected.variation.title")} ({selectedVariations.length})
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div>
                                    {getPermission(allConfigData?.permissions, Permissions.CREATE_PRODUCTS) &&
                                        product?.attributes?.product_type == 2 &&
                                        <Button
                                            type="button"
                                            variant="primary"
                                            onClick={openCreateSubProductModal}
                                            className="btn-light-primary"
                                            disabled={!availableVariationTypes.length}
                                        >
                                            {getFormattedMessage("variation.create.title")}
                                        </Button>
                                    }
                                </div>
                            </div>
                            <div>
                                <Table responsive="md">
                                    <thead>
                                        <tr>
                                            {isMultipleEditMode && (
                                                <th style={{ width: '50px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedVariations.length === allProducts.length && allProducts.length > 0}
                                                        onChange={handleSelectAllVariations}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </th>
                                            )}
                                            {product?.attributes?.product_type == 2 &&
                                                <th>
                                                    {getFormattedMessage(
                                                        "variations.title"
                                                    )}
                                                </th>
                                            }
                                            <th>
                                                {getFormattedMessage(
                                                    "product.product-details.cost.label"
                                                )}
                                            </th>
                                            <th>
                                                {getFormattedMessage(
                                                    "price.title"
                                                )}
                                            </th>
                                            <th>
                                                {getFormattedMessage(
                                                    "globally.detail.tax"
                                                )}
                                            </th>
                                            <th>
                                                {getFormattedMessage("product.product-in-stock.label")}
                                            </th>
                                            <th>
                                                {getFormattedMessage(
                                                    "dashboard.stockAlert.title"
                                                )}
                                            </th>
                                            <th className="text-center">
                                                {getFormattedMessage(
                                                    "react-data-table.action.column.label"
                                                )}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allProducts && allProducts.map((data, index) =>
                                            <tr key={index}>
                                                {isMultipleEditMode && (
                                                    <td className="py-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedVariations.includes(data.id)}
                                                            onChange={() => handleVariationSelect(data.id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </td>
                                                )}
                                                {product?.attributes?.product_type == 2 &&
                                                    <td className="py-4">
                                                        {`${data.variation_product?.variation_name}(${data.variation_product?.variation_type_name})`}
                                                    </td>
                                                }
                                                <td className="py-4">
                                                    {currencySymbolHandling(
                                                        allConfigData,
                                                        frontSetting?.value &&
                                                            frontSetting.value
                                                                .currency_symbol,
                                                        data.product_cost
                                                    )}
                                                </td>
                                                <td className="py-4">
                                                    {currencySymbolHandling(
                                                        allConfigData,
                                                        frontSetting?.value &&
                                                            frontSetting.value
                                                                .currency_symbol,
                                                        data.product_price
                                                    )}
                                                </td>
                                                <td className="py-4">
                                                    {data.order_tax
                                                        ? data.order_tax
                                                        : 0}
                                                    %
                                                </td>
                                                <td className="py-4">
                                                    {data.in_stock ? data.in_stock : 0}
                                                </td>
                                                <td className="py-4">
                                                    {data.stock_alert && data.stock_alert !== 'null' ? data.stock_alert : 0}
                                                </td>
                                                <td className="py-4">
                                                    <div className="text-center">
                                                        <button 
                                                            title={placeholderText('globally.view.tooltip.label')}
                                                            className='btn text-info px-2 fs-3 ps-0 border-0'
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openWareHouseDetailModal(data);
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faEye} />
                                                        </button>
                                                        {getPermission(allConfigData?.permissions, Permissions.EDIT_PRODUCTS) && 
                                                            <button 
                                                                title={placeholderText('globally.edit-btn')}
                                                                className='btn text-secondary px-2 fs-3 ps-0 border-0'
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openEditSubProductModal(data);
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faEdit} />
                                                            </button>
                                                        }
                                                        {getPermission(allConfigData?.permissions, Permissions.DELETE_PRODUCTS) && 
                                                            product?.attributes?.product_type == 2 && 
                                                            allProducts.length > 1 &&
                                                            <button 
                                                                title={placeholderText('globally.delete.tooltip.label')}
                                                                className='btn text-danger px-2 fs-3 ps-0 border-0'
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onClickDeleteModel(data);
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                        }
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                                <DeleteProduct
                                    onClickDeleteModel={onClickDeleteModel}
                                    deleteModel={deleteModel}
                                    onDelete={isDelete}
                                />
                                <CreateSubProductModal 
                                    show={showCreateSubProductModal} 
                                    setShow={setShowCreateSubProductModal} 
                                    commonData={commonDataForNewProduct} 
                                />
                                <EditSubProductModal 
                                    show={showEditSubProductModal} 
                                    setShow={setShowEditSubProductModal} 
                                    productData={productData} 
                                />
                                <WareHouseDetailsModal 
                                    show={showWarehouseModal} 
                                    productData={productData} 
                                    setShow={setShowWarehouseModal} 
                                />
                                <EditMultipleVariation
                                    show={showEditMultipleVariationModal}
                                    handleClose={handleCloseEditMultipleVariationModal}
                                    selectedVariationIds={selectedVariations}
                                    selectedVariationProducts={allProducts ? allProducts.filter((item) => selectedVariations.includes(item.id)) : []}
                                    mainProductId={id}
                                />
                            </div>
                        </div>
                    )}
                </>
            )}
        </MasterLayout>
    )
};

const mapStateToProps = (state) => {
    const { products, base, frontSetting, allConfigData } = state;
    return { products, base, frontSetting, allConfigData };
};

export default connect(mapStateToProps, { fetchMainProduct, fetchAllBaseUnits, productUnitDropdown, fetchAllunits })(EditProduct);
