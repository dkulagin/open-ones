/**
 * Licensed to Open-Ones Group under one or more contributor license
 * agreements. See the NOTICE file distributed with this work
 * for additional information regarding copyright ownership.
 * Open-Ones Group licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a
 * copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package openones.gate.util;

import java.util.ArrayList;
import java.util.List;

import openones.gate.intro.form.IntroOutForm;
import openones.gate.store.dto.IntroDTO;

/**
 * This class provides utilities to manipulate the entities, forms.
 * @author ThachLN
 */
public class DtoUtil {
    
    /**
     * Convert entity Introduction into the formatted data
     * @param dto entity of Introduction
     * @return formatted data form
     */
    public static IntroOutForm dto2IntroForm(IntroDTO dto) {
        IntroOutForm form = new IntroOutForm();
        
        form.setContent(dto.getStringContent());
        form.setMsgKey(String.valueOf(dto.getKey()));
        
        return form;
    }
    
    /**
     * Convert list of IntroDTO into list of IntroOutForm
     * @param dtoList list of entity Introduction
     * @return list of formatted Introduction data
     */
    public static List<IntroOutForm> dto2IntroFormList(List<IntroDTO> dtoList) {
        List<IntroOutForm> formList = new ArrayList<IntroOutForm>();
        
        for (IntroDTO dto : dtoList) {
            formList.add(dto2IntroForm(dto));
        }
        
        return formList;
    }
}
