import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap-v5";
import { useDispatch, useSelector } from "react-redux";
import ReactSelect from "../../shared/select/reactSelect";
import { syncMainProductLineItemsProduct } from "../../store/action/productAction";
import { getFormattedMessage, placeholderText } from "../../shared/sharedMethod";

const SyncProductLineItemsModal = ({
    show,
    onHide,
    mainProductId,
    conversionStatus,
    onSuccess,
}) => {
    const dispatch = useDispatch();
    const isSaving = useSelector((state) => state.isSaving);
    const [fromProduct, setFromProduct] = useState(null);
    const [toProduct, setToProduct] = useState(null);
    const [errors, setErrors] = useState({});

    const childProducts = conversionStatus?.child_products || [];
    const dataOptions = childProducts.map((p) => ({
        value: p.id,
        label: `${p.variation_label} — ${p.code}`,
    }));

    useEffect(() => {
        if (!show || !conversionStatus) {
            return;
        }
        const list = conversionStatus.child_products || [];
        const defaultId = conversionStatus.default_from_product_id;
        const opt = list.find((p) => Number(p.id) === Number(defaultId));
        if (opt) {
            setFromProduct({
                value: opt.id,
                label: `${opt.variation_label} — ${opt.code}`,
            });
        } else {
            setFromProduct(null);
        }
        setToProduct(null);
        setErrors({});
    }, [show, conversionStatus]);

    const handleSubmit = () => {
        const nextErrors = {};
        if (!fromProduct?.value) {
            nextErrors.from = getFormattedMessage(
                "product.sync.line.items.from.required"
            );
        }
        if (!toProduct?.value) {
            nextErrors.to = getFormattedMessage(
                "product.sync.line.items.to.required"
            );
        }
        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            return;
        }
        if (Number(fromProduct.value) === Number(toProduct.value)) {
            setErrors({
                general: getFormattedMessage(
                    "product.sync.line.items.same.error"
                ),
            });
            return;
        }

        dispatch(
            syncMainProductLineItemsProduct(
                mainProductId,
                {
                    from_product_id: fromProduct.value,
                    to_product_id: toProduct.value,
                },
                () => {
                    onHide();
                    if (onSuccess) {
                        onSuccess();
                    }
                }
            )
        );
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    {getFormattedMessage("product.sync.line.items.modal.title")}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-muted small mb-3">
                    {getFormattedMessage("product.sync.line.items.modal.help")}
                </p>
                {errors.general ? (
                    <div className="alert alert-danger" role="alert">
                        {errors.general}
                    </div>
                ) : null}
                <ReactSelect
                    title={getFormattedMessage(
                        "product.sync.line.items.from.label"
                    )}
                    data={dataOptions}
                    onChange={(obj) => {
                        setFromProduct(obj);
                        setErrors({});
                    }}
                    value={fromProduct}
                    placeholder={placeholderText(
                        "product.sync.line.items.from.placeholder"
                    )}
                    errors={errors.from}
                />
                <div className="mt-3">
                    <ReactSelect
                        title={getFormattedMessage(
                            "product.sync.line.items.to.label"
                        )}
                        data={dataOptions}
                        onChange={(obj) => {
                            setToProduct(obj);
                            setErrors({});
                        }}
                        value={toProduct}
                        placeholder={placeholderText(
                            "product.sync.line.items.to.placeholder"
                        )}
                        errors={errors.to}
                    />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    {getFormattedMessage("globally.cancel-btn")}
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={isSaving}
                >
                    {isSaving
                        ? getFormattedMessage("globally.saving-btn")
                        : getFormattedMessage("product.sync.line.items.confirm")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SyncProductLineItemsModal;
