import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap-v5";
import { useDispatch, useSelector } from "react-redux";
import ReactSelect from "../../shared/select/reactSelect";
import { fetchAllVariations } from "../../store/action/variationAction";
import { convertMainProductToVariation } from "../../store/action/productAction";
import {
    getFormattedMessage,
    placeholderText,
} from "../../shared/sharedMethod";

const ConvertSingleToVariationModal = ({
    show,
    onHide,
    mainProductId,
    onSuccess,
}) => {
    const dispatch = useDispatch();
    const variations = useSelector((state) => state.variations);
    const isSaving = useSelector((state) => state.isSaving);
    const [variation, setVariation] = useState(null);
    const [variationType, setVariationType] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (show) {
            dispatch(fetchAllVariations());
            setVariation(null);
            setVariationType(null);
            setErrors({});
        }
    }, [show, dispatch]);

    const variationOptions = (variations || []).map((v) => ({
        id: v.id,
        name: v.attributes?.name,
    }));

    const selectedVariationEntity = (variations || []).find(
        (v) => Number(v.id) === Number(variation?.value)
    );

    const typeOptions =
        selectedVariationEntity?.attributes?.variation_types?.map((vt) => ({
            id: vt.id,
            name: vt.name,
        })) || [];

    const onVariationChange = (obj) => {
        setVariation(obj);
        setVariationType(null);
        setErrors({});
    };

    const handleSubmit = () => {
        const nextErrors = {};
        if (!variation?.value) {
            nextErrors.variation = getFormattedMessage(
                "variation.select.validation.error.message"
            );
        }
        if (!variationType?.value) {
            nextErrors.variationType = getFormattedMessage(
                "variation.type.select.validate.error.message"
            );
        }
        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            return;
        }

        dispatch(
            convertMainProductToVariation(
                mainProductId,
                {
                    variation_id: variation.value,
                    variation_type_id: variationType.value,
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
                    {getFormattedMessage(
                        "product.convert.to.variation.modal.title"
                    )}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-muted small mb-3">
                    {getFormattedMessage(
                        "product.convert.to.variation.modal.help"
                    )}
                </p>
                <ReactSelect
                    title={getFormattedMessage("variations.title")}
                    multiLanguageOption={variationOptions}
                    onChange={onVariationChange}
                    value={variation}
                    placeholder={placeholderText(
                        "product.type.placeholder.label"
                    )}
                    errors={errors.variation}
                />
                <div className="mt-3">
                    <ReactSelect
                        title={getFormattedMessage("variation.types.title")}
                        multiLanguageOption={typeOptions}
                        onChange={(obj) => {
                            setVariationType(obj);
                            setErrors({});
                        }}
                        value={variationType}
                        placeholder={placeholderText(
                            "variation.type.input.name.placeholder.label"
                        )}
                        errors={errors.variationType}
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
                        : getFormattedMessage("globally.save-btn")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConvertSingleToVariationModal;
